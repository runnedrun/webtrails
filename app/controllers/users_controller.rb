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
    user = User.find_or_create_from_omniauth_hash(request.env["omniauth.auth"], whitelisted)
    if user
      cookies.permanent[:wt_auth_token] = user.wt_authentication_token
      redirect_to :controller => "trails", :action => "index"
    else
      render_server_error_ajax
    end
  end

  def get_all_trail_data
    render :json => {:trail_hash => @user.get_update_hash, :user_id => @user.id}
  end

end