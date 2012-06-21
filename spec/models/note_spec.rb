require "spec_helper"

describe Note do

  before do
    @content = Faker::Lorem.paragraph
    @site = Site.create(:url => "www.www.com")
    @note = Note.create(:content => @content, :scroll_x => 100, :scroll_y => 300)
  end

  it "should have content" do
    @note.content.should == @content
  end

  it "should be able to assign a site" do
    @note.site = @site
    @note.save
    @note.reload
    @note.site.should == @site
  end

  it "should have both an x and y scroll position" do
    @note.scroll_x.should == 100
    @note.scroll_y.should == 300
  end

end