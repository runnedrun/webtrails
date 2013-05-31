class NotesController < ApplicationController
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
    cors_preflight_check
    render :text => '', :content_type => 'text/plain'
  end

  def create
    begin
      site_id = params[:note][:site_id]
      site = Site.find(site_id)
      trail = site.trail

      unless trail.owner == @user
        render_not_authorized
      end

      @note = Note.create!(params[:note])
      render :json => {"note_content" => @note.content, "note_id" => @note.id}, :status => 200
    rescue
      render_server_error_ajax
    end
  end

  def delete
    begin
      note = Note.find(params[:id])
      site = note.site
      trail = site.trail
      if trail.owner != @user
        render_not_authorized
      end
      note.delete
      previous_note = site.reload.notes.find(:first, :order => "created_at DESC")
      previous_note_id = previous_note ? previous_note.id : "none"
      previous_note_content = previous_note ? previous_note.content : "none"
      render :json => {"id" => previous_note_id, "content" => previous_note_content}
    rescue
      render_server_error_ajax
    end
  end

end