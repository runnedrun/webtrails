require "spec_helper"

describe SitesController do
  describe "the create method" do
    before do
      @trail = Trail.create()
      @site_count = Site.count
      @note_count = Note.count
    end

    it "should create a new site belonging to the given trail" do
      post :create, :site => {"trail_id" => @trail.id, :url => "www.foo.com"}, :notes => "none"
      Site.count.should == @site_count + 1
      Site.last.trail.should == @trail
      Note.count.should == @note_count
    end

    it "should create a new site belonging to the given trail, with notes" do
      post :create, :site => {"trail_id" => @trail.id, :url => "www.foo.com"}, :notes => {0=>{:content => Faker::Lorem.paragraph}}
      Site.count.should == @site_count + 1
      Site.last.trail.should == @trail
      Note.count.should == @note_count +1
      Note.last.site.should == Site.last
    end

  end
end