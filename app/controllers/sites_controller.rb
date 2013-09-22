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
    site = Site.find(params[:siteID])
    resources_to_download = params[:originalToAwsUrlMap] || {}
    style_sheets_to_save = params[:styleSheets] || {}
    html_to_save = params[:html]
    is_iframe = params[:isIframe]
    revision_number = params[:revision]
    is_base_revision = params[:is_base_revision]

    Fiber.new do
      EM.synchrony do
        puts "into snychrony we go"
        ResourceHandler.new(resources_to_download,html_to_save,style_sheets_to_save,site, is_iframe, revision_number, is_base_revision)
      end
    end.resume

    render :json => {"message" => "success!"}
  end

  def generate_site_id
    new_site = Site.create(params[:site].merge({:user_id => @user.id}))
    Note.create!(params[:note].merge({:site_id => new_site.id})) if params[:note]

    render :json => {:current_trail_id => new_site.trail_id, :current_site_id => new_site.id, }
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
      params[:note][:site_id] = site_id
      @note = Note.create!(params[:note])
      render :json => {:trail_id => trail_id,:site_id => site_id,:note => @note,:new_note_row => render_to_string(partial: 'trails/note_row', locals: { :note => @note, :site_id => site_id })}, :status => 200
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
    site = Site.find(params[:site_id])
    notes = site.notes
    render(:json => {"notes" => notes,
                     "site_id" => site.id,
                     "domain" => site.domain,
                     "url" => site.url,
                     "title" => site.title,
                     "base_revision" => site.base_revision_number,
                    }, :status => 200)
  end

  def show
    site = Site.find(params[:id])
    puts site.base_archive_location
    if site.archive_location.nil?
      render :template => 'trails/loading'
    else
      @html = open(site.base_archive_location).read.html_safe
      render :layout => false, :text => @html
    end
  end

  def exists
    site = get_site_if_owned_by_user(params[:id])
    render :json => {:exists => !site.archive_location.nil?,:id => site.id, }, :status => 200
  end

  def update_note_list
    begin
      site = get_site_if_owned_by_user(params[:id])
      note_positions = params[:note_array]
      all_notes_authorized = site.update_note_list(note_positions)
      if all_notes_authorized
        render :json => {"status" => "success"}
      else
        render_not_authorized
      end
    rescue
      $stderr.puts $!.message
      render_server_error_ajax
    end
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

