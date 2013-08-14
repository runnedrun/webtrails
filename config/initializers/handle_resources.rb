#require 'celluloid/io'
#require 'celluloid/autostart'
require "em-synchrony"
require "em-synchrony/em-http"
#require 'eventmachine'
#require 'em-http'
require "fiber"
require "set"

class ResourceHandler

  def initialize(resources_to_download,html_to_save,stylesheets_to_save,site,is_iframe)
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
        site.archive_location = write_to_aws(html_to_save[0],html_to_save[1],false)
        site.save!
        puts "site saved to #{site.archive_location}"
      end
      @site.update_resource_set(@previously_saved_resource_set)
      puts "done saving"
      puts "have recorded #{@previously_saved_resource_set.size} saved resources"
    rescue
      puts "resource handler failed with error:"
      puts $!.message
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

  def write_to_aws(aws_path,data,resource_url)
    begin
      newFile = @bucket.objects[aws_path]
      #puts data[0..100]
      newFile.write(data,:acl => :public_read)
      #newFile.acl = :public_read
      #puts "resource saved to: " + newFile.public_url().to_s
      @previously_saved_resource_set.add(resource_url) if resource_url
      return "https://s3.amazonaws.com/TrailsSitesProto/" + aws_path #newFile.public_url().to_s
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