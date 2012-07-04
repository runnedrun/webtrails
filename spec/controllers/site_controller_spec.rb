require "spec_helper"
require  "json"

describe SitesController do
  describe "the create method" do
    def create_user()
      password = '123456'
      email  = Faker::Internet.email
      @user = User.create(:email => email, :password => password, :password_confirmation => password)
    end
    before do
      @user = create_user
      @trail = Trail.create(:owner => @user)
      @site = Site.create()
      @site_count = Site.count
      @note_count = Note.count

    end

    context "with the correct user" do

      it "should update the site so it belongs to the given trail" do
        post :create, :site => {:id => @site.id,  :trail_id => @trail.id, :url => "http://www.google.com" }, :notes => "none", :user => @user.id
        Site.count.should == @site_count
        Site.last.trail.should == @trail
        Note.count.should == @note_count
      end

      it "should create a new site belonging to the given trail, with notes" do
        post :create, :site => {"trail_id" => @trail.id, :url => "http://www.google.com"}, :notes => {0=>{:content => Faker::Lorem.paragraph}}, :user => @user.id
        Site.count.should == @site_count + 1
        Site.last.trail.should == @trail
        Note.count.should == @note_count +1
        Note.last.site.should == Site.last
      end

      it "should return status 200" do
        post :create, :site => {"trail_id" => @trail.id, :url => "http://www.google.com"}, :notes => {0=>{:content => Faker::Lorem.paragraph}}, :user => @user.id
        response.body.should == "done"
      end

      it "should save the site locally" do
        get :create, :site => {"trail_id" => @trail.id, :url => "http://www.google.com"}, :notes => {0=>{:content => Faker::Lorem.paragraph}}, :user => @user.id
        id_s = @trail.id.to_s
        path = Rails.root.to_s + "/saved_sites/" + id_s + "/www.google.com.html"
        file = File.open(path)
        file.read.should_not == ""
      end

      it "should save the location of the local archive on the site object" do
        get :create, :site => {"trail_id" => @trail.id, :url => "http://www.google.com"}, :notes => {0=>{:content => Faker::Lorem.paragraph}}, :user => @user.id
        path = Rails.root.to_s + "/saved_sites/" + @trail.id.to_s + "/www.google.com.html"
        Site.last.archive_location.should == path
        File.open(Site.last.archive_location).read.should_not == ""
      end

      describe "async_site_load" do
        before do
          @notes = []
          @content = Faker::Lorem.paragraph
          @scroll_x = 54
          @scroll_y = 65
          4.times do
            @notes.push(Note.create(:content => @content, :scroll_x => @scroll_x, :scroll_y => @scroll_y))
          end
          @site = Site.create(:url => "http://www.google.com", :title => "google, you know what it is", :notes => @notes, :domain => "google.com", :archive_location => "/home/david/webtrails/proto1/saved_sites/www.google.com.html")
        end

        it "should respond with the html for a site" do
          get :async_site_load, :site_id => @site.id
          resp_hash = JSON.parse(response.body)
          Hpricot(resp_hash["src"]).search("body").should be_true

          resp_hash["notes"].length.should == 4
          resp_hash["notes"]["2"]["content"].should == @content
          resp_hash["notes"]["2"]["scroll_x"] == @scroll_x
          resp_hash["notes"]["2"]["scroll_y"] == @scroll_y
          resp_hash["site_id"].should == @site.id
          resp_hash["domain"].should == @site.domain
          resp_hash["url"].should == @site.url

      end

    end

    end

    context "without a user signed in" do
      it "should 404" do
        get :create, :site => {"trail_id" => @trail.id, :url => "http://www.google.com"}, :notes => {0=>{:content => Faker::Lorem.paragraph}}, :user => (@user.id+1)
        response.code.should == "404"
      end
    end

  end

  describe "the show action" do

    before do
      @site = Site.create(:archive_location => File.join(Rails.root,"wiki.html"))
    end

    it "should return the html for the specified site" do
      get :show, :id => @site.id
      response.body.should_not == ""
    end
  end




end