class UsersController < ApplicationController

  def new
    $stderr.puts "making new user"
    @user = User.new()
  end

end