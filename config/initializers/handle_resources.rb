require "em-synchrony"
require "em-synchrony/em-http"
require "fiber"
require "set"

class ResourceHandler

  def initialize(resources_to_download, html_to_save, stylesheets_to_save, site, note, is_iframe, revision_number,
      is_base_revision, character_encoding)
    begin
      puts "inside resources handler"
      s3 = AWS::S3.new
      @bucket = s3.buckets["TrailsSitesProto"]
      @site = site
      @resources_to_download = resources_to_download
      @stylesheets_to_save = stylesheets_to_save
      @archive_location = ""
      @is_iframe = is_iframe
      @resource_to_path_hash = {}
      @previously_saved_resource_set = site.retrieve_resource_set

      @html_saved = false
      @stylesheets_saved = false
      @resources_mirrored = false


      EM::Synchrony::Iterator.new(resources_to_download, resources_to_download.length).each do |url, iter|
        resource_location = url[0]
        aws_path = url[1]
        mirror_resource_to_aws(resource_location,aws_path,iter)
      end

      puts "finished getting resources, now saving stylesheets"

      EM::Synchrony::Iterator.new(stylesheets_to_save, stylesheets_to_save.length).each do |url, iter|
        aws_path = url[0]
        stylesheet = url[1]
        async_write_to_aws(aws_path,stylesheet,iter,url)
      end

      puts "finished saving stylesheets, saving html now"

      puts is_iframe.class

      if is_iframe == "false"
        puts "not iframe, saving!"
        site.add_revision(revision_number)
        site.base_revision_number = revision_number.to_i if is_base_revision
        puts revision_number
        site.archive_location = write_to_aws(html_to_save[0], html_to_save[1], false, revision_number.to_s,
                                             {:content_type => "text/html; charset="+character_encoding})
        site.save!
        if note
          note.site_revision_number = revision_number
          note.save!
        end
        puts "site saved to #{site.archive_location} with revision number #{revision_number}"
      end
      @site.update_resource_set(@previously_saved_resource_set)
      puts "done saving"
      puts "have recorded #{@previously_saved_resource_set.size} saved resources"
    rescue
      puts "resource handler failed with error:"
      puts $!.message
      puts $!.backtrace
    end
  end

  def mirror_resource_to_aws(url,place_to_save,iter)
    if !@previously_saved_resource_set.include?(url)
      resp = html_get_site(url,iter) { |http|
        async_write_to_aws(place_to_save,http.response,iter,url)
      }
    else
      iter.next
    end
  end

  def html_get_site(url,iter,&callback)
    user_agent = "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:13.0) Gecko/20100101 Firefox/13.0"
    url_no_dot_dot = url.to_s.gsub(/\/\w*\/\.\.\//,"/")
    #resp = (url_no_dot_dot, "User-Agent" => user_agent, :allow_redirections => :all)
    http = EventMachine::HttpRequest.new(url_no_dot_dot, "User-Agent" => user_agent, :allow_redirections => :all).aget
    http.errback { puts "request failed for: #{url_no_dot_dot}";iter.next }
    http.callback &callback
  end

  def async_write_to_aws(aws_path,data,iter,resource_url)
    Fiber.new do
      begin
        write_to_aws(aws_path,data,resource_url)
        iter.next
      rescue
        puts "error when writing to aws asynchronously"
        puts $!.message
      end
    end.resume
  end

  def write_to_aws(aws_path, data, resource_url, revision_number = false, options = {})
    begin
      aws_path_with_rev = revision_number ? File.join(aws_path, revision_number.to_s) : aws_path
      newFile = @bucket.objects[aws_path_with_rev]
      newFile.write(data,{:acl => :public_read, :cache_control => "max-age=157680000, public"}.merge(options))
      @previously_saved_resource_set.add(resource_url) if resource_url
      return "https://s3.amazonaws.com/TrailsSitesProto/" + aws_path
    rescue
      $stderr.puts aws_path.to_s+"had a problem saving"
      puts $!.message
      return false
    end
  end

  #def finish_site_if_ready
  #  if @html_saved and @resources_mirrored and @stylesheets_saved and !@is_iframe
  #    puts "setting site archive location"
  #    @site.archive_location = @archive_location
  #    @site.save!
  #  end
  #end

  #def async_fetch(url)
  #  f = Fiber.current
  #  http = EventMachine::HttpRequest.new(url).get :timeout => 10
  #  http.callback { f.resume(http) }
  #  http.errback { f.resume(http) }
  #  return Fiber.yield
  #end

end