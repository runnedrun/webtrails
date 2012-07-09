class SitesController < ApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:create,:options]
  after_filter :cors_set_access_control_headers

  def cors_set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    headers['Access-Control-Max-Age'] = "1728000"
  end

  def cors_preflight_check
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-Prototype-Version'
    headers['Access-Control-Max-Age'] = '1728000'
  end

  def options
    cors_preflight_check
    render :text => '', :content_type => 'text/plain'
  end

  def create
    #trail = Trail.find(params[:site][:trail_id])
    #if trail.owner.id.to_s == params[:user]
    remote = RemoteDocument.new(params[:site][:url],params[:html])
    url = params[:site][:url]
    http_end = (url =~ (/:\/\//)) + 3
    path = "/"+params[:site][:trail_id]
    remote.mirror(path)

    site = Site.find(params[:site][:id])
    site.update_attributes(params[:site].merge({:archive_location => remote.asset_path.to_s, :html_encoding => remote.encoding}))
    site.build_notes(params[:notes])

    render :json => "done", :status => 200
  #else
  #  render :status => 404, :nothing => true
    #end
  end

  def async_site_load
    site = Site.find(params[:site_id])

    notes = {}
    site.notes.each_with_index do |note, i|
      notes[i] = {"content" => note.content, "scroll_x" => note.scroll_x, "scroll_y" => note.scroll_y}
    end

    puts site.archive_location

    src = open(site.archive_location).read.force_encoding('utf-8')


    render :json => {"src" => src, "notes" => notes, "site_id" => site.id, "domain" => site.domain, "url" => site.url}, :status => 200
  end

  def show
    site = Site.find(params[:id])
    @html = open(site.archive_location).read.force_encoding(site.html_encoding).html_safe
    render :layout => false, :text => @html
  end

  private

  class RemoteDocument
    require 'nokogiri'
    require 'net/http'
    require 'net/https'
    require 'fileutils'
    require 'uri'
    require 'open-uri'
    require 'charlock_holmes'


    attr_reader :uri, :save_path, :bucket, :asset_path, :encoding, :src
    attr_reader :contents
    attr_reader :css_tags, :js_tags, :img_tags, :meta, :links



    def initialize(uri,html)
      @uri = URI(uri)
      s3 = AWS::S3.new
      @bucket = s3.buckets["TrailsSitesProto"]
      @src = html
    end


  #=begin rdoc
  #Download, parse, and save the RemoteDocument and all resources (JS, CSS,
  #images) in the specified directory.
  #=end
    def mirror(dir)
      source = @src
      @encoding = CharlockHolmes::EncodingDetector.detect(source)[:encoding]
      inline_css_parsed  = save_css_urls_to_s3(source,File.join(dir,"images"),@uri)
      @contents = Nokogiri::HTML( inline_css_parsed, nil ,@encoding )
      process_contents
      save_locally(dir)
    end


  #=begin rdoc
  #Extract resources (CSS, JS, Image files) from the parsed html document.
  #=end
    def process_contents
      @css_tags = @contents.xpath( '//link[@rel="stylesheet"]' )
      @js_tags = @contents.xpath('//script')
      @img_tags = @contents.xpath( '//img[@src]' )
      # Note: meta tags and links are unused in this example
      find_meta_tags
      find_links
    end


  #=begin rdoc
  #Extract contents of META tags to @meta Hash.
  #=end
    def find_meta_tags
      @meta = {}
      @contents.xpath('//meta').each do |tag|
        last_name = name = value = nil
        tag.attributes.each do |key, attr|
          if attr.name == 'content'
            value = attr.value
          elsif attr.name == 'name'
            name = attr.value
          else
            last_name = attr.value
          end
        end
        name = last_name if not name
        @meta[name] = value if name && value
      end
    end


  #=begin rdoc
  #Generate a Hash URL -> Title of all (unique) links in document.
  #=end
    def find_links
      @contents.xpath('//a[@href]').each do |tag|
        begin
          tag[:href] = @uri.scheme.to_s + "://" + @uri.host.to_s + tag[:href].to_s if !(URI(tag[:href]).scheme)
        rescue
          Rails.logger.error("#{tag[:href]} is probably invalid")
        end
      end
    end


  #=begin rdoc
  #Generate a local, legal filename for url in dir.
  #=end
    def localize_url(url, dir)
      path = url.gsub(/^[|[:alpha]]+:\/\//, '')
      path.gsub!(/^[.\/]+/, '')
      path.gsub!(/[^-_.\/[:alnum:]]/, '_')
      File.join(dir, path)
    end


  #=begin rdoc
  #Construct a valid URL for an HREF or SRC parameter. This uses the document URI
  #to convert a relative URL ('/doc') to an absolute one ('http://foo.com/doc').
  #=end
    def url_for(str)
      url_base = uri.scheme + "://" +  uri.host
      return str if str =~ /^[|[:alpha:]]+:\/\//
      return (uri.scheme+"://"+ str[2..-1]) if str =~ /^\/\//
      if str[0] != "/"
        return File.join(File.dirname(uri.to_s),str) if uri.path.index(".")
        return File.join(uri.to_s,str)
      end
      File.join(url_base, str)
    end

    def relative_url_for(str,relative_dir)
      relative_dir = relative_dir.to_s
      relative_uri = URI(relative_dir)
      url_base = relative_uri.scheme + "://" +  relative_uri.host
      return str if str =~ /^[|[:alpha:]]+:\/\//
      return (relative_uri.scheme+"://"+ str[2..-1]) if str =~ /^\/\//
      if str[0] != "/"
        return File.join(File.dirname(relative_dir),str) if relative_uri.path.index(".")
        return File.join(relative_dir,str)
      end
      File.join(url_base, str)
    end


  #=begin rdoc
  #Send GET to url, following redirects if required.
  #=end
    def html_get_site(url)
      user_agent = "Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:13.0) Gecko/20100101 Firefox/13.0"
      begin
        resp = open(url, "User-Agent" => user_agent)
        return resp.read
      rescue
        $stderr.puts url.to_s+" returned 400 or something"
      end
    end

    def html_get(url)
      http = Net::HTTP.new(url.host, 80)
      if url.scheme == "https"
        http.use_ssl = true
      end
      request = Net::HTTP::Get.new(url.request_uri)
      resp = http.request(request)

      #if ['301', '302', '307'].include? resp.code
      #  url = URI.parse resp['location']
      #elsif resp.code.to_i >= 400
      #  $stderr.puts "[#{resp.code}] #{url}"
      #  return
      #end

      http.request(request)
    end


  #=begin rdoc
  #Download a remote file and save it to the specified path
  #=end
    def download_resource(url, path)
      the_uri = URI.parse(url)
      newFile = false
      if the_uri
        data = html_get_site the_uri
        if data
          begin
            newFile = @bucket.objects[path]
            newFile.write(data)
          rescue

          end
        end
      end
      newFile
    end


  #=begin rdoc
  #Download resource for attribute 'sym' in 'tag' (e.g. :src in IMG), saving it to
  #'dir' and modifying the tag attribute to reflect the new, local location.
  #=end
    def localize(tag, sym, dir)
      delay
      url = tag[sym]
      resource_url = url_for(url)
      dest = localize_url(url, dir)
      s3File = download_resource(resource_url, dest)
      if s3File
        s3File.acl = :public_read
        tag[sym.to_s] = s3File.public_url().to_s
      end
    end

    def localize_css_recursively(tag, sym, dir)
      delay
      url = tag[sym]
      resource_url = url_for(url)
      dest = localize_url(url, dir)

      css_string = html_get_site resource_url
      if css_string
        localized_css_string = save_css_urls_to_s3(css_string,dir,resource_url)
        newFile = false

        if localized_css_string
          begin
            newFile = @bucket.objects[dest]
            newFile.write(localized_css_string)
          rescue
            newFile = false
            $stderr.puts resource_url.to_s+"had a problem saving"
          end
        end

        if newFile
          newFile.acl = :public_read
          tag[sym.to_s] = newFile.public_url().to_s
        end
      end
    end

    def save_css_urls_to_s3(css_string,dir,css_file_url)
      beginning_of_url = css_string.index("url(")
      if beginning_of_url
        url_onward = css_string[beginning_of_url+4..-1]
        end_of_url = url_onward.index(")")
        url = url_onward[0..end_of_url-1].gsub(/\s+/, "")
        url = url[1..-2] if ((url[0] == "'") or (url[0] == '"'))
        new_url = url
        if !url.index("data:")
          dest = localize_url(url,dir)
          source = relative_url_for(url,css_file_url)
          s3File = download_resource(source,dest)

          if s3File
            s3File.acl = :public_read
            new_url = s3File.public_url().to_s
          end
        end
        first_half = css_string[0..beginning_of_url+3]
        second_half = save_css_urls_to_s3(url_onward[end_of_url..-1],dir,css_file_url)
        return (first_half + new_url + second_half)
      else
        return css_string
      end
    end


  #=begin rdoc
  #Attempt to "play nice" with web servers by sleeping for a few ms.
  #=end
  def delay
      sleep(rand / 100)
  end


  #=begin rdoc
  #Download all resources to destination directory, rewriting in-document tags
  #to reflect the new resource location, then save the localized document.
  #Creates destination directory if it does not exist.
  #=end
    def save_locally(dir)
      # remove HTML BASE tag if it exists
      @contents.xpath('//base').each { |t| t.remove }
      # save resources

      @img_tags.each { |tag| localize(tag, :src, File.join(dir, 'images')) }
      @js_tags.each { |tag| tag.remove }
      @css_tags.each { |tag| localize_css_recursively(tag, :href, File.join(dir, 'css')) }

      @save_path = File.join(dir, File.basename(uri.to_s))
      @save_path += '.html' if @save_path !~ /\.((html?)|(txt))$/
      #File.open(@save_path, 'w') { |f| f.write(@contents.to_html) }
      newFile = @bucket.objects[@save_path]
      newFile.write(@contents.to_html.force_encoding(@encoding))
      newFile.acl = :public_read
      @asset_path = newFile.public_url().to_s
      return true
    end
  end


end

