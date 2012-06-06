require File.dirname(__FILE__) + '/../spec_helper'

describe Trail do
  before do
    @sites = (1..4).inject([]) {|result,new| result << (Site.create(:url => "http://www.site#{new.to_s}.com"))}
    @trail = Trail.create(:name => "fun trail", :sites => @sites)

  end
  it "should have the correct name attribute" do
    @trail.name.should == "fun trail"
  end
  it "should have many sites" do
    @trail.reload
    @trail.sites.should == @sites
  end
end