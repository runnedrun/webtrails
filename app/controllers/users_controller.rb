class UsersController < ApplicationController

  def new
    @user = User.new()
  end

  def login_or_create_gmail_user
    begin
      auth_token = params[:access_token]
      puts params[:expires_on]
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

  def login_via_oauth2

  end

end