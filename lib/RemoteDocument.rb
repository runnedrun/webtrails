#from http://entrenchant.blogspot.com/2012/02/web-page-mirroring-wget-in-ruby.html
require 'nokogiri'
require 'net/http'
require 'fileutils'
require 'uri'

#=begin rdoc
#Wrap a URI and provide methods for download, parsing, and mirroring of remote HTML document.
#=end
class RemoteDocument
  attr_reader :uri
  attr_reader :contents
  attr_reader :css_tags, :js_tags, :img_tags, :meta, :links



  def initialize(uri)
    @uri = uri
  end


#=begin rdoc
#Download, parse, and save the RemoteDocument and all resources (JS, CSS,
#images) in the specified directory.
#=end
  def mirror(dir)
    source = html_get(uri)
    @contents = Nokogiri::HTML( source )
    process_contents
    save_locally(dir)
  end


#=begin rdoc
#Extract resources (CSS, JS, Image files) from the parsed html document.
#=end
  def process_contents
    @css_tags = @contents.xpath( '//link[@rel="stylesheet"]' )
    @js_tags = @contents.xpath('//script[@src]')
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
    @links = {}
    @contents.xpath('//a[@href]').each do |tag|
      @links[tag[:href]] = (tag[:title] || '') if (! @links.include? tag[:href])
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
    return str if str =~ /^[|[:alpha:]]+:\/\//
    File.join((uri.path.empty?) ? uri.to_s : File.dirname(uri.to_s), str)
  end


#=begin rdoc
#Send GET to url, following redirects if required.
#=end
  def html_get(url)
    resp = Net::HTTP.get_response(url)
    if ['301', '302', '307'].include? resp.code
      url = URI.parse resp['location']
    elsif resp.code.to_i >= 400
      $stderr.puts "[#{resp.code}] #{url}"
      return
    end
    Net::HTTP.get url
  end


#=begin rdoc
#Download a remote file and save it to the specified path
#=end
  def download_resource(url, path)
    FileUtils.mkdir_p File.dirname(path)
    the_uri = URI.parse(url)
    if the_uri
      data = html_get the_uri
      File.open(path, 'wb') { |f| f.write(data) } if data
    end
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
    download_resource(resource_url, dest)
    tag[sym.to_s] = dest.partition(File.dirname(dir) + File::SEPARATOR).last
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
    Dir.mkdir(dir) if (! File.exist? dir)

    # remove HTML BASE tag if it exists
    @contents.xpath('//base').each { |t| t.remove }


    # save resources
    @img_tags.each { |tag| localize(tag, :src, File.join(dir, 'images')) }
    @js_tags.each { |tag| localize(tag, :src, File.join(dir, 'js')) }
    @css_tags.each { |tag| localize(tag, :href, File.join(dir, 'css')) }


    save_path = File.join(dir, File.basename(uri.to_s))
    save_path += '.html' if save_path !~ /\.((html?)|(txt))$/
    File.open(save_path, 'w') { |f| f.write(@contents.to_html) }
  end
end
