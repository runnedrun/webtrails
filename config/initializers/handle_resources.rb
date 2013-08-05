require 'celluloid/io'
require 'celluloid/autostart'
require "fiber"
require 'net/http'
require 'net/https'


class ResourceHandler
  include Celluloid::IO

  def initialize(resources_to_download,html_to_save,stylesheets_to_save,site,is_iframe)
    s3 = AWS::S3.new
    @bucket = s3.buckets["TrailsSitesProto"]
    @site = site
    @resources_to_download = resources_to_download
    @stylesheets_to_save = stylesheets_to_save
    @archive_location = ""
    @is_iframe = is_iframe

    @html_saved = false
    @stylesheets_saved = false
    @resources_mirrored = false


    resources_to_download.each do |url,place_to_save|
      async.mirror_resource_to_aws(url,place_to_save)
    end

    async.save_html_to_aws(html_to_save[0],html_to_save[1])

    stylesheets_to_save.each do |aws_path,stylesheet|
      async.save_stylesheet_to_aws(aws_path,stylesheet)
    end
    puts "finishing initialize"
  end

  def mirror_resource_to_aws(url,place_to_save)
    resp = html_get_site(url)
    write_to_aws(place_to_save,resp)
    puts "mirrored the site!: " + url
    @resources_to_download.delete(url)
    if @resources_to_download.empty?
      @resources_mirrored = true
    end
    finish_site_if_ready
  end

  def save_stylesheet_to_aws(aws_path,stylesheet)
    write_to_aws(aws_path,stylesheet)
    @stylesheets_to_save.delete(aws_path)
    if @stylesheets_to_save.empty?
      @stylesheets_saved = true
    end
    finish_site_if_ready
  end

  def save_html_to_aws(aws_path,html)
    @archive_location = write_to_aws(aws_path,html)
    if @archive_location
      puts "wrote html to aws"
      @html_saved = true
      finish_site_if_ready
    end
  end

  def html_get_site(url)
    user_agent = "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:13.0) Gecko/20100101 Firefox/13.0"
    begin
      url_no_dot_dot = url.to_s.gsub(/\/\w*\/\.\.\//,"/")
      resp = open(url_no_dot_dot, "User-Agent" => user_agent, :allow_redirections => :all)
      return resp.read
    rescue
      $stderr.puts url.to_s+" returned 400 or something"
      return false
    end
  end

  def write_to_aws(aws_path,data)
    begin
      newFile = @bucket.objects[aws_path]
      newFile.write(data)
      newFile.acl = :public_read
      return newFile.public_url().to_s
    rescue
      $stderr.puts aws_path.to_s+"had a problem saving"
      puts $!.message
      return false
    end
  end

  def finish_site_if_ready
    if @html_saved and @resources_mirrored and @stylesheets_saved and !@is_iframe
      puts "setting site archive location"
      @site.archive_location = @archive_location
      @site.save!
    end
  end

end