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
      post :create, :site => {:id => @site.id,  :trail_id => @trail.id, :url => @html_url, :title => "this is cool no?" }, :notes => "none", :user => @user.id, :html => @html
    end

    def setup_aws_mocks
      @file_mock = double(AWS::S3::S3Object)

      @file_mock.should_receive(:acl=).exactly(7).times.with(:public_read)
      @file_mock.should_receive(:public_url).exactly(7).times {@only_url_in_the_doc}

      file_hash_mock = double(Hash)
      file_hash_mock.stub(:[]) {@file_mock}

      @bucket_mock = double(AWS::S3::Bucket)
      @bucket_mock.stub(:objects) {file_hash_mock}

      bucket_hash_mock = double(Hash)
      bucket_hash_mock.stub(:[]) {@bucket_mock}

      @s3_mock = double(AWS::S3)
      @s3_mock.stub(:buckets){bucket_hash_mock}

      AWS::S3.stub(:new) { @s3_mock }

    end

    before do
      @user = create_user
      @trail = Trail.create(:owner => @user)
      @site = Site.create()
      @site_count = Site.count
      @note_count = Note.count

      @html_url = File.join(Rails.root, "spec/test_statics/test.html")
      @html = File.read(@html_url)
      @only_url_in_the_doc

      setup_aws_mocks

    end

    context "with the correct user" do

      it "should save a site and suceed" do
        @file_mock.should_receive(:write).exactly(7).times
        make_create_request
        response.response_code.should == 200
      end

      it "should save @import tags correctly" do
        @file_mock.should_receive(:write) do |args|
          args.should include "sameLevel3ShouldSave"
        end
        @file_mock.should_receive(:write).exactly(6).times
        make_create_request
      end

      it "should save url() tags correctly" do
        @file_mock.should_receive(:write).exactly(1).times
        @file_mock.should_receive(:write) do |args|
          args.should include "same level 4 should save"
        end
        @file_mock.should_receive(:write).exactly(5).times
        make_create_request
      end

      it "should correctly replace references to external resources" do
        @file_mock.should_receive(:write).exactly(7).times
        make_create_request
        response.body.scan(/#{@only_url_in_the_doc}/).length.should == 5
      end

      it "should remove all script tags" do
        @file_mock.should_receive(:write).exactly(7).times
        make_create_request
        response.body.scan(/thisShouldNotExist/).length.should == 0
        response.body.scan(/this should get cut out.  fo sho/).length.should == 0
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