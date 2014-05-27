class NotesController < ApplicationController
  before_filter :get_user_from_wt_auth_header_or_cookie_or_return_401
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
      render :json => {:note_content => @note.content, :note_id => @note.id}, :status => 200
    rescue
      puts "create note failed with error:"
      puts $!.message
      puts $!.backtrace.to_a
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
      else
        note.delete_note_revision_from_site
        note.delete
        render :json => {"update_hash" => @user.get_update_hash}
      end
    rescue
      puts $!.message
      puts $!.backtrace.to_a
      render_server_error_ajax
    end
  end

  def update
    begin
      note = Note.find(params[:id])
      site = note.site
      trail = site.trail
      if trail.owner != @user
        render_not_authorized
      else
        note.comment = params[:comment]
        note.save!
        render :json => {"content" => note.content, "comment" => note.comment}
      end
    rescue
      render_server_error_ajax
    end
  end

  def ready
    begin
      note = Note.find(params[:id])
      site = note.site
      trail = site.trail
      if trail.owner != @user
        render_not_authorized
      else
        if note.site_revision_number
          render :json => {"ready" => true}
        else
          render :json => {"ready" => false}
        end
      end
    rescue
      puts "note exists failed"
      puts $!.message
      puts $!.backtrace.to_a
      render_server_error_ajax
    end
  end

end