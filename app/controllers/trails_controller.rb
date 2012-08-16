class TrailsController < ApplicationController

  before_filter :authenticated_or_redirect, :only => [:index]
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
    trail = Trail.create(:owner => current_user, :name => params[:name])
    bookmarklet = bookmarklet_string(trail.id, current_user.id, params[:name])
    render :json => {:bookmarklet => bookmarklet}
  end

  def show
    @trail = Trail.find(params[:id])
    @favicon_urls_with_ids_and_titles = @trail.sites.inject([]) do |urls, site|
      search_name = URI(site.url).host
      urls.push(["http://www.google.com/s2/favicons?domain=" + search_name, site.id, site.title])
    end
    @favicon_urls_with_ids_and_titles
    @sites = @trail.sites
    @site_note_hash = {}
    @sites.each {|site| @site_note_hash[site.id] = site.notes.map {|note| [note.content,note.id] }}
  end


  def index
    @trails = current_user.trails
    @favicon_urls = @trails.map do |trail|
      trail.sites.map do |site|
        search_name = URI(site.url).host
        "http://www.google.com/s2/favicons?domain=" + search_name
      end
    end
  end

  def site_list
    trail = Trail.find(params[:trail_id])
    favicons_and_urls = trail.sites.inject([]) do |fav_list, site|
      fav_list.push(["http://www.google.com/s2/favicons?domain=" + URI(site.url).host.to_s,site.url])
    end
    favicons_and_urls.push(["http://www.google.com/s2/favicons?domain=" + URI(params[:current_url]).host.split(".")[-2..-1].to_s,"#"])
    site = Site.create!()
    render :json => {"favicons_and_urls" => favicons_and_urls, :site_id => site.id}
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

      myScript.src = '#{Proto1::Application::AJAX_REQUEST_URL}/bookmarklet_js';
      myScript.onload = function (){
      script.src = 'http://ajax.googleapis.com/ajax/libs/jquery/' + v + '/jquery.min.js';
      script.onload = script.onreadystatechange = initMyBookmarklet;
      document.getElementsByTagName('head')[0].appendChild(script);
      };
      document.getElementsByTagName('head')[0].appendChild(myScript);

      })();">#{trail_name}</a>}
  end

end