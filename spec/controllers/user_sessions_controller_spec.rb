require 'spec_helper'

describe UserSessionsController do

  describe "the new action" do
    before do
      fake_email = Faker::Internet.email
      @user = User.new()
    end
    it "should create a new user session" do

    end
  end
end
