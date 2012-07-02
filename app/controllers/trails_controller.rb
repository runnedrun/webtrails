class TrailsController < ApplicationController

  before_filter :authenticated_or_redirect, :only => [:index, :show]
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


  def new

  end

  def create
    begin
      trail = Trail.create!(params[:trail])
      if params[:sites].class != String
        for site in params[:sites].values
          trail.build_site_with_notes(site)
        end
      end
      render :json => {"id" => trail.id}, :status =>200
    end
  end

  def show
    @trail = Trail.find(params[:id])
    @favicon_urls_with_ids = @trail.sites.inject([]) do |urls, site|
      search_name = URI(site.url).host
      urls.push(["http://www.google.com/s2/favicons?domain=" + search_name, site.id])
    end
    puts @favicon_urls_with_ids
    @first_site_url
  end


  def index
    @trails = current_user.trails
  end

  def site_list
    trail = Trail.find(params[:trail_id])
    favicons_and_urls = trail.sites.inject([]) do |fav_list, site|
      fav_list.push(["http://www.google.com/s2/favicons?domain=" + URI(site.url).host.to_s,site.url])
    end
    favicons_and_urls.push(["http://www.google.com/s2/favicons?domain=" + URI(params[:current_url]).host.to_s,"#"])
    site = Site.create!()
    render :json => {"favicons_and_urls" => favicons_and_urls, :site_id => site.id}
  end

end