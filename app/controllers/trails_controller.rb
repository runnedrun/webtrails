class TrailsController < ApplicationController

  #before_filter :authenticated_or_redirect, :only => [:index]
  #before_filter :get_user_from_wt_auth_header, :except => [:show,:index]
  #before_filter :get_user_from_wt_auth_cookie, :only => [:index,:show]
  before_filter :get_user_from_wt_auth_header_or_cookie
  #before_filter :get_user_from_auth_token_in_params_and_set_cookie, :only => [:show]
  #skip_before_filter :verify_authenticity_token, :only => [:create,:options]
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

  private

  def bookmarklet_string(trail_id,user_id,trail_name)
    %{<a href="Javascript:(function(){
      window.siteHTML = document.getElementsByTagName('html')[0].innerHTML;
      var v = '1.4.1';
      var script = document.createElement('script');
      var myScript = document.createElement('script');
      window.userID = #{user_id};
      window.trailID = #{trail_id};

      myScript.src = '#{Webtrails::Application::AJAX_REQUEST_URL}/bookmarklet_js';
      myScript.onload = function (){
      script.src = 'http://ajax.googleapis.com/ajax/libs/jquery/' + v + '/jquery.min.js';
      script.onload = script.onreadystatechange = initMyBookmarklet;
      document.getElementsByTagName('head')[0].appendChild(script);
      };
      document.getElementsByTagName('head')[0].appendChild(myScript);

      })();">#{trail_name}</a>}
  end

  def get_user_from_auth_token_in_params_and_set_cookie
    $stderr.puts("looking in params for auth token")
    if request.cookies["wt_auth_token"]
      wt_auth_token = request.cookies["wt_auth_token"]
      @user = User.find_by_wt_auth_token(wt_auth_token)
    end
    puts @user
    if !@user
      wt_auth_token = params[:auth_token]
      if wt_auth_token
        @user = User.find_by_wt_auth_token(wt_auth_token)
        puts @user
        if !@user
          puts "rendering 401"
          render :status => 401, :text => "token invalid, please trail again"
          return
        end
      else
        $stderr.puts("token not found")
        render :status => 401, :text => "please authenticate your request with a valid token"
        return
      end
    end
    puts "setting cookie"
    cookies.permanent[:wt_auth_token] = wt_auth_token
  end

end