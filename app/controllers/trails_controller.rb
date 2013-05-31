class TrailsController < ApplicationController
  before_filter :get_user_from_wt_auth_header_or_cookie
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
    puts "getting options request"
    cors_preflight_check
    render :text => '', :content_type => 'text/plain'
  end

  def create
    trail = Trail.create(:owner => current_user, :name => params[:name])
    bookmarklet = bookmarklet_string(trail.id, current_user.id, params[:name])
    render :json => {:bookmarklet => bookmarklet}
  end

  def show
    @trail = @user.trails.where(:id => params[:id]).first

    if !@trail
      render status => 401, :html => "you do not have access to this trail"
    end

    @sites = @trail.sites.sort_by(&:created_at)
    @favicon_urls_with_ids_and_titles = @sites.inject([]) do |urls, site|
      search_name = URI(site.url).host
      urls.push(["http://www.google.com/s2/favicons?domain=" + search_name, site.id, site.title])
    end
    @favicon_urls_with_ids_and_titles

    @site_note_hash = {}
    @sites.each {|site| @site_note_hash[site.id] = site.notes.map {|note| [note.content,note.id] }}
  end


  def index
    @user = current_user
    @trails = current_user.trails.sort_by(&:created_at)
    @favicon_urls = @trails.map do |trail|
      trail.sites = trail.sites.sort_by(&:created_at)
      trail.sites.map do |site|
        search_name = URI(site.url).host
        "http://www.google.com/s2/favicons?domain=" + search_name
      end
    end

    @trails.each {|trail| trail.sites.sort_by!(&:created_at)}
  end

  def site_list

    current_trail_id = params[:trail_id]
    trail = nil

    trail = @user.trails.where(:id => params[:trail_id]).first if current_trail_id


    # if the trail_id was empty, or not owned by the user, send by the users latest trail
    # this is so our favicon list doesn't break if something goes wrong with the extension.
    if trail == nil
      trail = @user.trails.sort_by(&:created_at).last
    end

    if trail
      favicons_and_urls = trail.sites.sort_by(&:created_at).inject([]) do |fav_list, site|
        fav_list.push(["http://www.google.com/s2/favicons?domain=" + URI(site.url).host.to_s,site.url])
      end
      favicons_and_urls.push(["http://www.google.com/s2/favicons?domain=" + URI(params[:current_url]).host.split(".")[-2..-1].to_s,"#"])
      render :json => {"favicons_and_urls" => favicons_and_urls, "trail_id" => trail.id}
    else
      render :json => {"favicons_and_urls" => [], "trail_id" => ""}
    end

  end

end