class ApplicationController < ActionController::Base
  protect_from_forgery

  def authenticated_or_redirect
    redirect_to ("/users/new") unless user_signed_in?
  end
end
