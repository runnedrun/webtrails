class ApplicationController < ActionController::Base
  protect_from_forgery

  def authenticated_or_redirect
    redirect_to ("/users/new") unless user_signed_in?
  end

  def authenticated_or_404_ajax
    render(:status => 404, :nothing => true) unless user_signed_in?
  end

  def renderServerErrorAjax
    render :status => 500, :json => ["Sorry, we're having some problems, please trail again later!"]
  end

  def get_user_from_wt_auth_cookie
    if request.host == ENV["SAME_DOMAIN"]
      puts "looking in cookie for token"
      wt_auth_token = request.cookies["wt_auth_token"]
      if wt_auth_token
        @user = User.find_by_wt_auth_token(wt_auth_token)
        unless @user
          render :status => 401, :json => "token invalid, please trail again"
        end
      else
        $stderr.puts("token not found")
        render :status => 401, :json => ["please authenticate your request with a valid token"]
      end
    else
      render :status => 401, :json => ["incorrect domain, sorry!"]
    end
  end

  def get_user_from_wt_auth_header
    puts "looking in header for token"
    wt_auth_token = request.headers["WT_AUTH_TOKEN"]
    if wt_auth_token
      puts "got auth token from header"
      @user = User.find_by_wt_auth_token(wt_auth_token)
      unless @user
        render :status => 401, :json => "token invalid, please trail again"
      end
    else
      puts "token not found in header"
      render :status => 401, :json => ["please authenticate your request with a valid token"]
    end
  end

  def get_user_from_wt_auth_header_or_cookie
    #if request.host
  end

end
