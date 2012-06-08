require "spec_helper"

describe UsersController do
  render_views

  describe "the create method" do
    before do
      @user_count = User.count
      @email = Faker::Internet.email
      @password = Faker::Name.first_name
    end

    it "should create a new user with the given parameters" do
      post :create, :user => {:email => @email, :password => @password, :password_confirmation => @password}
      response.response_code.should == 302
      response.should redirect_to "/new_trail"
      User.count.should == @user_count + 1
    end

    it "should return 400 if the wrong parameters are given" do
      post :create, :user => {:email => "", :password => "12345678", :password_confirmation => "12345678"}
      response.should redirect_to "/new_user"
    end



  end

  describe "the new method" do
    it "should render the new view" do
      get :new
      response.should render_template(:new)
    end

  end
end