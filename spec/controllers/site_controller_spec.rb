require "spec_helper"
require  "json"
require "open-uri"

describe SitesController do
  describe "the create method" do
    def create_user()
      password = '123456'
      email  = Faker::Internet.email
      @user = User.create(:email => email, :password => password, :password_confirmation => password)
    end

    def make_create_request
      post :create, :site => {:id => @site.id,  :trail_id => @trail.id, :url => "http://www.google.com", :title => "this is cool no?" }, :notes => "none", :user => @user.id, :html => @html
    end

    def setup_aws_mocks


      @file_mock = double(AWS::S3::S3Object)
      @file_mock.should_receive(:write).exactly(7).times
      @file_mock.should_receive(:acl=).exactly(7).times.with(:public_read)
      @file_mock.should_receive(:public_url).exactly(7).times {@only_url_in_the_doc}


      @bucket_mock = double(AWS::S3::Bucket)
      @bucket_mock.should_receive(:objects) {{}.stubs(:[]){@file_mock}}

      @s3_mock = double(AWS::S3)
      @s3_mock.should_receive(:buckets){{}.stub(:[]){@bucket_mock}}

      AWS::S3.stub(:new) { @s3_mock }

    end

    before do
      @user = create_user
      @trail = Trail.create(:owner => @user)
      @site = Site.create()
      @site_count = Site.count
      @note_count = Note.count

      @html_url = File.join(Rails.root, "spec/test_statics/test.html")
      @html = File.open(@html_url)
      @only_url_in_the_doc

      setup_aws_mocks

    end

    context "with the correct user" do

      describe "the create method" do
        make_create_request
        response.response_code.should == 200
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