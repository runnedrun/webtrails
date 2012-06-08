require "spec_helper"

describe Note do

  before do
    @content = Faker::Lorem.paragraph
    @site = Site.create(:url => "www.www.com")
    @note = Note.create(:content => @content)
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

end