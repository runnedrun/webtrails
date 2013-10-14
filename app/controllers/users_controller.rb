class UsersController < ApplicationController
  before_filter :get_user_from_wt_auth_header_or_cookie_or_return_401, :only => [:sign_out,:get_all_trail_data]

  def new
    @whitelisted = params[:whitelisted]
    @whitelisted_okay = (@whitelisted == "boothedog")
  end

  def sign_out
    puts "signing out"
    @user.sign_out
    #cookies.permanent[:wt_signed_out] = "signed_out"
    cookies.delete :wt_auth_token
    redirect_to "/"
    #render :text => "oeoeooeooe"
  end

  def login_or_create_gmail_user
    begin
      auth_token = params[:access_token]
      expires_on = Time.at(params[:expires_on].to_i/1000)

      @user = User.find_for_google_oauth2(auth_token,expires_on)
      if @user
        render :json => @user
      else
        render :status => 401, :json =>{error: "something seems to be wrong with your auth token"}
      end
    rescue
      $stderr.puts $!.message
      $stderr.puts $!.backtrace
      render :status => 500, :json =>{error: "something went wrong, please trail again later"}
    end
  end

  def oauth2_callback
    whitelisted = request.env["omniauth.params"]["whitelisted"]
    user = User.find_or_create_from_omniauth_hash(request.env["omniauth.auth"],whitelisted)
    if user
      cookies.permanent[:wt_auth_token] = user.wt_authentication_token
      redirect_to :controller => "trails", :action => "index"
    else
      render_server_error_ajax
    end
  end

  def get_all_trail_data
    trail_site_hash = {}
    @user.trails.each do |trail|
      trail_site_hash[trail.id] = {:site_list => trail.site_list, :html_hash => {}, :note_hash => {}}
      trail.sites.each do |site|
        trail_site_hash[trail.id][:html_hash][site.id] = {:base_location => site.archive_location,
                                                          :revision_numbers => site.get_revisions(),
                                                          :base_revision => site.base_revision_number}
        note_hash = trail_site_hash[trail.id][:note_hash][site.id] = {}
        note_hash[:note_ids_in_order] = site.note_list
        note_hash[:note_data] = site.notes.inject({}) do |hash,note|
          hash[note.id] = {:comment => note.comment,
                           :client_side_id => note.client_side_id,
                           :site_revision_number => note.site_revision_number,
                           :scroll_x => note.scroll_x,
                           :scroll_y => note.scroll_y,
                           :id => note.id}
          hash
        end
      end
    end
    render :json => {:trail_hash => trail_site_hash, :user_id => @user.id}
  end

end