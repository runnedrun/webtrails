require 'spec_helper'

describe Site do
  before do
    @site = Site.create(:url => "http://www.google.com")
  end
  it "should have a url attribute" do
    @site.url.should == "http://www.google.com"
  end
end
