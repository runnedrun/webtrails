#require 'celluloid/io'
#require 'celluloid/autostart'
require "em-synchrony"
require "em-synchrony/em-http"
#require 'eventmachine'
#require 'em-http'
require "fiber"

class ResourceHandler

  def initialize(resources_to_download,html_to_save,stylesheets_to_save,site,is_iframe)
    puts "inside resources handler"
    s3 = AWS::S3.new
    @bucket = s3.buckets["TrailsSitesProto"]
    @site = site
    @resources_to_download = resources_to_download
    @stylesheets_to_save = stylesheets_to_save
    @archive_location = ""
    @is_iframe = is_iframe
    @resource_to_path_hash = {}

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
      async_write_to_aws(aws_path,stylesheet,iter)
    end

    puts "finished saving stylesheets, saving html now"

    puts is_iframe.class

    if is_iframe == "false"
      puts "not iframe, saving!"
      site.archive_location = write_to_aws(html_to_save[0],html_to_save[1])
      site.save!
      puts "site saved to #{site.archive_location}"
    end
    puts "done saving"
  end

  def mirror_resource_to_aws(url,place_to_save,iter)
    resp = html_get_site(url,iter) { |http|
      if url == "https://fbexternal-a.akamaihd.net/safe_image.php?d=AQDQblnpvCgfNzRE&url=http%3A%2F%2Ffb.ecn.api.tiles.virtualearth.net%2Fapi%2FGetMap.ashx%3Fb%3Dr%252Cmkt.en-US%252Cstl.fb%26key%3DAqSHdMNkhSvgWwMhbqyiqgW1IhMNeV56Gb0WkfgEDm6jSsfX9gDGmlOUEt3i44Jk%26td%3DD1%26c%3D39.150700962286%252C-77.205137284316%26h%3D64%26w%3D64%26ppl%3D37%252C%252C39.1507%252C-77.2051%26z%3D10&jq=100"
        puts "returned from get for the resource"
      end
      async_write_to_aws(place_to_save,http.response,iter)
    }
  end

  def save_stylesheet_to_aws(aws_path,stylesheet)
    async_write_to_aws(aws_path,stylesheet)
    @stylesheets_to_save.delete(aws_path)
    if @stylesheets_to_save.empty?
      @stylesheets_saved = true
    end
    finish_site_if_ready
  end

  def save_html_to_aws(aws_path,html)
    @archive_location = async_write_to_aws(aws_path,html)
    if @archive_location
      #puts "wrote html to aws"
      @html_saved = true
      finish_site_if_ready
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

  def async_write_to_aws(aws_path,data,iter)
    Fiber.new do
      write_to_aws(aws_path,data)
      iter.next
    end.resume
  end

  def write_to_aws(aws_path,data)
    begin
      newFile = @bucket.objects[aws_path]
      #puts data[0..100]
      newFile.write(data,:acl => :public_read)
      #newFile.acl = :public_read
      #puts "resource saved to: " + newFile.public_url().to_s
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