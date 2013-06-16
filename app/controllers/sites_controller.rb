class SitesController < ApplicationController
  before_filter :get_user_from_wt_auth_header_or_cookie_or_return_401, :except => [:show, :async_site_load]
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
    begin
      html = params[:html]
      url = params[:site][:url]
      trail_id = params[:site][:trail_id]
      shallow_save = params[:shallow_save]

      if trail_id.empty?
        new_trail = Trail.create!(:name => "New Trail!")
        new_trail.owner = @user
        trail_id = new_trail.id
        params[:site][:trail_id] = trail_id
      else
        trail = @user.trails.where(:id => trail_id).first
        if !trail
          render_not_authorized
        end
      end

      $stderr.puts "shallow_save at create", shallow_save, params[:site][:id]
      if shallow_save != ""
        site_id = params[:site][:id]
        site = trail.sites.find(site_id)
        if !site
          render_not_authorized
        end
        shallow_save=true
      else
        site_id = Site.create!(params[:site]).id
        shallow_save=false
      end

      Site.delay.save_site_to_aws(html,url,trail_id,shallow_save,site_id)

      if (params[:note] and params[:note] != "none")
        # We should save the note, too.
        params[:note][:site_id] = site_id
        @note = Note.create!(params[:note])
        render :json => {:trail_id => trail_id, :site_id => site_id, :note_content => @note.content, :note_id => @note.id}, :status => 200
      else
        render :json => {:trail_id => trail_id, :site_id => site_id}, :status => 200
      end
    rescue
      puts $!.message
      render_server_error_ajax
    end
  end

  #this performs a save without doing any kind of parsing of html, which is only
  #ok when you're saving from view page, with already parsed html
  def new_note_from_view_page
    begin
      html = params[:html]
      trail_id = params[:site][:trail_id]
      trail = @user.trails.where(:id => trail_id).first
      if !trail
        render_not_authorized
      end
      site_id = params[:site][:id]
      site = trail.sites.find(site_id)
      if !site
        render_not_authorized
      end

      site.update_html(html)
      if (params[:note] and params[:note] != "none")
        # We should save the note, too.
        params[:note][:site_id] = site_id
        @note = Note.create!(params[:note])
        render :json => {:trail_id => trail_id, :site_id => site_id, :note_content => @note.content, :note_id => @note.id}, :status => 200
      else
        render :json => {:trail_id => trail_id, :site_id => site_id}, :status => 200
      end
    rescue
      puts $!.message
      render_server_error_ajax
    end
  end

  def delete
    site = Site.find(params[:id])
    if site
      site_owner = site.trail.owner
      if site_owner != @user
        render_not_authorized
      end
      site.destroy
    end
    render :json => {"error" => nil}, :status => 200
  end

  def async_site_load
    $stderr.puts "Async site load " + String(params[:site_id])
    site = Site.find(params[:site_id])

    notes = []
    site.notes.each_with_index do |note, i|
      notes[i] = {"content" => note.content, "scroll_x" => note.scroll_x, "scroll_y" => note.scroll_y, "note_id" => note.id,
                  "comment" => note.comment, "comment_location_x" => note.comment_location_x,
                  "comment_location_y" => note.comment_location_y, "client_side_id" => note.client_side_id}
    end

    notes.sort_by! {|note| Integer(note["client_side_id"].sub("client_side_id_",""))}
    render :json => {"notes" => notes, "site_id" => site.id, "domain" => site.domain, "url" => site.url, "title" => site.title}, :status => 200
  end

  def show
    site = Site.find(params[:id])

    if site.archive_location.nil?
      render :template => 'trails/loading'
    else
      puts site.archive_location
      @html = open(site.archive_location).read.force_encoding(site.html_encoding).html_safe
      render :layout => false, :text => @html
    end
  end

  def exists
    site = get_site_if_owned_by_user(params[:id])
    render :json => {:exists => !site.archive_location.nil?,:id => site.id}, :status => 200
  end

  private

  def get_site_if_owned_by_user(id)
    site = Site.find(id)
    if site
      site_owner = site.trail.owner
      if site_owner != @user
        render_not_authorized
        return false
      end
    end
    return site
  end



end

