class NotesController < ApplicationController
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
    $stderr.puts "note create:", params[:note]
    @note = Note.create!(params[:note])
    render :json => {"note_content" => @note.content, "note_id" => @note.id}, :status => 200
  end

  def delete
    note = Note.find(params[:id])
    site = note.site
    note.delete
    previous_note = site.reload.notes.find(:first, :order => "created_at DESC")
    previous_note_id = previous_note ? previous_note.id : "none"
    previous_note_content = previous_note ? previous_note.content : "none"
    render :json => {"id" => previous_note_id, "content" => previous_note_content}
  end

end