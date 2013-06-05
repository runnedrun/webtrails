class TrailsController < ApplicationController
  before_filter :get_user_from_wt_auth_header_or_cookie_or_return_401, :except => [:show]
  before_filter :get_user_or_set_nil, :only => :show
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
    begin
      puts "creating trail"
      trail = Trail.create(:owner => @user, :name => params[:name])
      puts "setting cookie"
      cookies['wt_new_trail_name'] = URI::escape(trail.name)
      cookies['wt_new_trail_id'] = URI::escape(trail.id.to_s)
      puts "cookies set"
      render :json => {:message => "trail created"}, :status => 200
    rescue
      puts $!.message
      render_server_error_ajax
    end
  end

  def show
    @editAccess = !(!@user || !@user.trails.where(:id => params[:id]).first)
    @trail = Trail.where(:id => params[:id]).first
    $stderr.puts "trail", @trail, !@trail
    if !@trail
      $stderr.puts "show has no trail", params[:id]
      return render(:status => 404, :json => {:error => "No trail here."})
    end

    @sites = @trail.sites.sort_by(&:created_at)
    @favicon_urls_with_ids_and_titles = @sites.inject([]) do |urls, site|
      search_name = URI(site.url).host
      urls.push(["http://www.google.com/s2/favicons?domain=" + search_name, site.id, site.title])
    end
    $stderr.puts @favicon_urls_with_ids_and_titles

    @site_note_hash = {}
    @sites.each {|site| @site_note_hash[site.id] = site.notes.map {|note| [note.content,note.id] }}
  end

  def get_favicons_for_trails(trails)
    trails.map do |trail|
      trail.sites = trail.sites.sort_by(&:created_at)
      trail.sites.map do |site|
        search_name = URI(site.url).host
        "http://www.google.com/s2/favicons?domain=" + search_name
      end
    end
  end

  def index
    @trails = @user.trails.sort_by(&:created_at)
    puts @user.email
    @favicon_urls = get_favicons_for_trails(@trails)

    @trails.each {|trail| trail.sites.sort_by!(&:created_at)}


    @other_trails = (Trail.all - @trails).sample(10)
    @other_favicon_urls = get_favicons_for_trails(@other_trails)

    @other_trails.each {|trail| trail.sites.sort_by!(&:created_at)}
  end

  def delete
    trail = Trail.find(params[:id])
    if trail
      site_owner = trail.owner
      if site_owner != @user
        render_not_authorized
      end
      trail.delete
    end
    render :json => {"error" => nil}, :status => 200
  end

  def update
    $stderr.puts "Got to update"
    begin
      trail = Trail.find(params[:id])
      if trail.owner != @user
        render_not_authorized
      else
        trail.name = params[:name]
        trail.save!
        render :json => {"name" => trail.name}
      end
    rescue
      $stderr.puts $!.message
      render_server_error_ajax
    end
  end

  def site_list
    current_trail_id = params[:trail_id]
    trail = nil

    trail = @user.trails.where(:id => params[:trail_id]).first if current_trail_id

    trails = {}
    @user.trails.each { |trail| trails[trail.id] = trail.name }


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
      render :json => {"favicons_and_urls" => favicons_and_urls, "trail_id" => trail.id, "trails" => trails}
    else
      render :json => {"favicons_and_urls" => [], "trail_id" => "", "trails" => trails}
    end

  end

end