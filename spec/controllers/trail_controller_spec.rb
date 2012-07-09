require "spec_helper"

describe TrailsController do
  def create_user()
    password = '123456'
    email  = Faker::Internet.email
    @user = User.create(:email => email, :password => password, :password_confirmation => password)
  end

  describe "the new action" do
    it "should render the new trails page" do
      get :new
      response.should render_template(:new)
    end
  end

  describe "the create action" do
    before do
      @trail_count = Trail.count
      @user = create_user
      sign_in @user
    end

    it "should take in a trail name and make a new trail for the current user" do
      post :create, :name => "my new trail"
      Trail.count.should == @trail_count +1
      Trail.last.owner.should == @user
      Trail.last.name.should == "my new trail"
    end

    it "should return the text for the bookmarklet with the correct user_id and trail ID" do
      post :create, :name => "my new trail"
      response.body.index(Trail.last.id.to_s).should_not be_nil
      response.body.index(@user.id.to_s).should_not be_nil
      response.body.index("my new trail").should_not be_nil
    end
  end

  describe "the index action" do
    before do
      @user = create_user()
      (1..4).each do |i|
        Trail.create(:name=> "trail#{i}", :owner => @user, :sites => [])
      end
      @user.trails.length.should==4
    end

    it "should return all the trails for the current user" do
      sign_in @user
      get :index
      response.response_code.should == 200
      assigns("trails").should == @user.trails
    end

    it "should redirect to the login page if the user is not signed in" do
      get :index
      response.response_code.should == 302
      response.should redirect_to("/users/new")
    end
  end

  describe "the methods which return sites" do

    before do
      @trail = Trail.create()
      1..4.times do
        Site.create(:trail => @trail, :url =>"www.google.com")
      end
    end

    describe "the site_list action" do
      it "should return a list of favicon urls for the all the trails sites" do
        get :site_list, :trail_id => @trail.id, :current_url => "www.google.com"
        JSON.parse(response.body)["favicons_and_urls"].length.should == 5
        JSON.parse(response.body)["favicons_and_urls"][0][1].should == "www.google.com"
        JSON.parse(response.body)["site_id"].should == Site.last.id
      end
    end
  end

end