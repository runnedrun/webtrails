class SitesController < ApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:create,:options]
  before_filter :get_user_from_wt_auth_header
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
    #begin
      html = params[:html]
      url = params[:site][:url]
      trail_id = params[:site][:trail_id]
      shallow_save = params[:shallow_save]


      if trail_id.empty?
        new_trail = Trail.create!(:name => "New Trail!")
        @user.trails.push(new_trail)
        @user.save!
        trail_id = new_trail.id
        params[:site][:trail_id] = trail_id
      else
        trail = @user.trails.where(:id => trail_id).first
        if !trail
          render :status => 401, :json => "you do not own this trail, try a different one"
        end
      end

      $stderr.puts "shallow_save at create", shallow_save, params[:site][:id]
      if shallow_save != ""
        site_id = params[:site][:id]
        shallow_save=true
      else
        site_id = Site.create!(params[:site]).id
        shallow_save=false
      end
      Site.delay.save_site_to_aws(html,url,trail_id,shallow_save,site_id)
      render :json => {:site_id => site_id}, :status => 200
    #rescue
    #  render :status => 500, :json => "we're experiencing some difficulty, please trail again later"
    #end
  end

  def delete
    site = Site.find(params[:id])
    site.delete
    render :json => {"error" => nil}, :status => 200
  end

  def async_site_load
    site = Site.find(params[:site_id])

    notes = {}
    site.notes.each_with_index do |note, i|
      notes[i] = {"content" => note.content, "scroll_x" => note.scroll_x, "scroll_y" => note.scroll_y, "note_id" => note.id,
                  "comment" => note.comment, "comment_location_x" => note.comment_location_x,
                  "comment_location_y" => note.comment_location_y, "client_side_id" => note.client_side_id}
    end

    render :json => {"notes" => notes, "site_id" => site.id, "domain" => site.domain, "url" => site.url, "title" => site.title}, :status => 200
  end

  def show
    site = Site.find(params[:id])
    if site.archive_location.nil?
      render :template => 'trails/loading'
    else
      @html = open(site.archive_location).read.force_encoding(site.html_encoding).html_safe
      render :layout => false, :text => @html
    end
  end

  def exists
    puts "getting exists request"
    site = Site.find(params[:id])
    render :json => {:exists => !site.archive_location.nil?}, :status => 200
  end

end

