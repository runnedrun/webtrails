class ApplicationController < ActionController::Base
  protect_from_forgery

  def authenticated_or_redirect
    redirect_to ("/users/new") unless user_signed_in?
  end

  def authenticated_or_404_ajax
    render(:status => 404, :nothing => true) unless user_signed_in?
  end

  def render_server_error_ajax
    render :status => 500, :json => ["Sorry, we're having some problems, please trail again later!"]
  end

  def render_incorrect_token
    render :status => 401, :json => ["incorrect or non-existent auth token, please try again."]
  end

  def render_not_authorized
    render :status => 401, :json => ["not authorized to take that action"]
  end


  def get_user_from_wt_auth_header_or_cookie_or_return_401
    get_user_or_set_nil
    if !@user
      if request.format == "text/html"
        redirect_to :controller => :users, :action => :new
      else
        render_incorrect_token
      end
    end
    if @user and !@user.whitelisted?
      render :template => 'users/not_whitelisted'
    end
  end

  def get_user_or_set_nil
    @user = nil
    puts "looking in header for token"
    wt_auth_token = request.headers["WT_AUTH_TOKEN"]
    if wt_auth_token
      @user = User.find_by_wt_auth_token(wt_auth_token)
    else
      #render :status => 401, :json => ["please authenticate your request with a valid token"]
    end

    if request.host == ENV["SAME_DOMAIN"] and !@user
      puts "looking in cookie for token"
      wt_auth_token = request.cookies["wt_auth_token"]
      puts wt_auth_token
      if wt_auth_token
        @user = User.find_by_wt_auth_token(wt_auth_token)
      else

      end
    end
  end


end
