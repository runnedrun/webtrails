class TrailsController < ApplicationController

  before_filter :authenticated_or_redirect, :only => [:index, :show]

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
      search_name = ((site.url[7] == "/") ? site.url[8..-1]: site.url[7..-1]) #check if the url is https
      urls.push(["http://www.google.com/s2/favicons?domain=" + search_name, site.id])
    end
    @first_site_url
  end


  def index
    @trails = current_user.trails
  end

end