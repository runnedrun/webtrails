require 'spec_helper'

describe UserSessionsController do

  describe "the new action" do
    before do
      fake_email = Faker::Internet.email
      @user = User.new()
    end
    it "should create a new user session and a new user" do
      get :new
      assigns(:user_session).class.should == UserSession
      assigns(:user).class.should == User
    end
  end
end
