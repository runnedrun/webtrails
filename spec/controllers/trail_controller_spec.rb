require "spec_helper"

describe TrailsController do
  def create_and_log_in_user()
    password = Faker::Name.first_name
    email  = Faker::Internet.email
    User.create(:email => email, :password => password, :password_confirmation => password)
    UserSession.create(:email => email, :password => password)
  end

  describe "the new action" do
    it "should render the new trails page" do
      get :new
      response.should render_template(:new)
    end
  end

  describe "the create or update action" do

    before do
      @user = User.create(:email => "d@d.com", :password=> "12345", :password_confirmation => "12345")
      @existing_site = Site.create(:notes => [Note.create(:content => Faker::Lorem.paragraph)], :url => "www.foo.com")
      @existing_trail = Trail.create(:sites => [@existing_site], :name => "my trail", :owner => @user  )
      @trail_count = Trail.count
      @site_count = Site.count
      @note_count = Note.count
    end

    it "should create the trail with the given url if the trail does not already exist, without sites" do
      post :create, :trail => {:name => "my new trail", :owner => @user}, :sites => "none"
      Trail.count.should == @trail_count+1
      Site.count.should == @site_count
      Note.count.should == @note_count
      response.response_code.should == 200
      JSON.parse(response.body).keys.include?("id").should == true
    end

    it "should be able to create a trail with sites and notes" do
      post :create, :trail => {:name => "my new trail", :owner => @user}, :sites => {"0"=> {:notes => {"0"=> {:content => Faker::Lorem.paragraph}}, :url => "www.noo.com"}}
      Site.count.should == @site_count + 1
      Note.count.should == @note_count + 1
      Trail.last.sites.should_not == []
      Site.last.notes.should_not == []
    end

    it "should be able to create a trail with sites but no notes, represented by notes => 'none' " do
      post :create, :trail => {:name => "my new trail", :owner => @user}, :sites => {"0" => {:notes => "none", :url => "www.noo.com"}}
      Site.count.should == @site_count + 1
      Note.count.should == @note_count
      Trail.last.sites.should_not == []
      Site.last.notes.should == []
    end

  end

  describe "the index action" do
    before do
      @user = create_and_log_in_user()
      (1..4).each do |i|
        Trail.create(:name=> "trail#{i}", :owner => @user, :sites => [])
      end
      @user.trails.length.should==4
    end

    it "should return all the trails for the current user" do
      get :index
      response.response_code.should == 200
      assigns("trails").should == @user.trails
    end

  end



end