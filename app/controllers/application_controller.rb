class ApplicationController < ActionController::Base
  protect_from_forgery

  def authenticated_or_redirect
    redirect_to ("/users/new") unless user_signed_in?
  end

  def authenticated_or_404_ajax
    render(:status => 404, :nothing => true) unless user_signed_in?
  end

  def get_user_from_wt_auth_header
    wt_auth_token = request.headers["WT_AUTH_TOKEN"]
    if wt_auth_token
      $stderr.puts("token: " + wt_auth_token)
      @user = User.find_by_wt_auth_token(wt_auth_token)
      unless @user
        render :status => 401, :json => "token invalid, please trail again"
      end
    else
      $stderr.puts("token not found")
      render :status => 401, :json => ["please authenticate your request with a valid token"]
    end
  end

end
