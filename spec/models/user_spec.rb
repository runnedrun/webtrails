require 'spec_helper'

describe User do
  describe "creating a user" do
    before do
      @email = Faker::Internet.email
      @password = Faker::Name.first_name
      @user = User.create(:email => @email, :password => @password, :password_confirmation => @password)
    end
    it "should create a user with valid attributes" do
      @user.reload
      @user.email.should == @email
      @user.crypted_password.class.should == String
    end
    it "should be able to own trails" do
      owned_trail = Trail.create(:name => "hey", :sites => [], :owner => @user)
      shared_trail = Trail.create(:users => [@user])
      @user.owned_trails.should include owned_trail
      @user.owned_trails.should_not include shared_trail
    end
  end
end