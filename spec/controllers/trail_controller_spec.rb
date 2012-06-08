require "spec_helper"

describe TrailsController do
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
      post :create, :trail => {:name => "my new trail", :owner => @user}, :sites => []
      Trail.count.should == @trail_count+1
      Site.count.should == @site_count
      Note.count.should == @note_count
      response.response_code.should == 200
    end

    it "should be able to create a trail with sites and notes" do
      post :create, :trail => {:name => "my new trail", :owner => @user}, :sites => [{:notes => [{:content => Faker::Lorem.paragraph}], :url => "www.noo.com"}]
      Site.count.should == @site_count + 1
      Note.count.should == @note_count + 1
    end

    it "should be able to create a trail with sites but no notes" do
      post :create, :trail => {:name => "my new trail", :owner => @user}, :sites => [{:notes => [], :url => "www.noo.com"}]
      Site.count.should == @site_count + 1
      Note.count.should == @note_count
    end

  end

end