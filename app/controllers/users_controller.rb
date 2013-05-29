class UsersController < ApplicationController

  def new
    @user = User.new()
  end

  def login_or_create_gmail_user
    begin
      $stderr.puts "got new user request"
      $stderr.puts "still here"
      auth_token = params[:access_token]
      $stderr.puts "authtoken = " + auth_token

      @user = User.find_for_google_oauth2(auth_token)
      render :json => @user
    rescue
      $stderr.puts $!.message
      $stderr.puts $!.backtrace
      render :status => 500
    end
  end

end