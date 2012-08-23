require "spec_helper"
require  "json"
require "open-uri"

describe SitesController do
  def create_user()
    password = '123456'
    email  = Faker::Internet.email
    @user = User.create(:email => email, :password => password, :password_confirmation => password)
  end
  describe "the create method" do
    def make_create_request
      post :create, :site => {:id => @site.id,  :trail_id => @trail.id, :url => @html_url, :title => "this is cool no?" }, :notes => "none", :user => @user.id, :html => @html
    end

    def setup_aws_mocks
      @file_mock = double(AWS::S3::S3Object)

      @file_mock.should_receive(:acl=).exactly(8).times.with(:public_read)
      @file_mock.should_receive(:public_url).exactly(8).times {@only_url_in_the_doc}

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
      @only_url_in_the_doc = "www.onlyurl.com"

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
        @file_mock.should_receive(:write).exactly(7).times
        make_create_request
      end

      it "should save url() tags correctly" do
        @file_mock.should_receive(:write).exactly(1).times
        @file_mock.should_receive(:write) do |args|
          args.should include "same level 4 should save"
        end
        @file_mock.should_receive(:write).exactly(6).times
        make_create_request
      end

      it "should correctly replace references to external resources" do
        @file_mock.should_receive(:write).exactly(7).times
        @file_mock.should_receive(:write).exactly(1) do |args|
          $stderr.puts(args)
          args.scan(/#{@only_url_in_the_doc}/).length.should == 6
        end
        make_create_request
      end

      it "should remove all script tags" do
        @file_mock.should_receive(:write).exactly(7).times
        @file_mock.should_receive(:write).exactly(1) do |args|
          args.scan(/thisShouldNotExist/).length.should == 0
          args.scan(/this should get cut out.  fo sho/).length.should == 0
        end
        make_create_request
      end

      it "should properly save iframes recursively" do
        @file_mock.should_receive(:write) do |args|
          args.should include "same level 5 should save"
        end
        @file_mock.should_receive(:write).exactly(7).times
        make_create_request
      end

      it "should remove all the noscript tags" do
        @file_mock.should_receive(:write).exactly(7).times
        @file_mock.should_receive(:write).exactly(1) do |args|
          args.scan(/noscript should not exist/).length.should == 0
        end
        make_create_request
      end



    end
  end

  describe "async_site_load" do
    before do
      @notes = []
      @content = Faker::Lorem.paragraph
      @comment = Faker::Lorem.paragraph
      @scroll_x = 54
      @scroll_y = 65
      @comment_location_y = 200
      @comment_location_x = 100
      4.times do
        @notes.push(Note.create(:content => @content, :scroll_x => @scroll_x, :scroll_y => @scroll_y,
                                :comment =>@comment, :comment_location_x => @comment_location_x, :comment_location_y => @comment_location_y))
      end
      @site = Site.create(:url => "http://www.google.com", :title => "google, you know what it is", :notes => @notes,
                          :domain => "google.com", :archive_location => File.join(Rails.root, "spec/test_statics/test.html"))
    end

    it "should respond with the html for a site" do
      get :async_site_load, :site_id => @site.id
      resp_hash = JSON.parse(response.body)
      Hpricot(resp_hash["src"]).search("body").should be_true
      resp_hash["site_id"].should == @site.id
      resp_hash["domain"].should == @site.domain
      resp_hash["url"].should == @site.url
      resp_hash["title"].should == @site.title

    end

    it "should respond with the correct notes" do
      get :async_site_load, :site_id => @site.id
      resp_hash = JSON.parse(response.body)
      resp_hash["notes"].length.should == 4
      resp_hash["notes"]["2"]["content"].should == @content
      resp_hash["notes"]["2"]["scroll_x"].should == @scroll_x
      resp_hash["notes"]["2"]["scroll_y"].should == @scroll_y
      resp_hash["notes"]["2"]["comment_location_x"].should == @comment_location_x
      resp_hash["notes"]["2"]["comment_location_y"].should == @comment_location_y
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