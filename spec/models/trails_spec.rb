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
  describe "users and trails" do
    before do
      email = Faker::Internet.email
      password = Faker::Name.first_name
      @user = User.create(:email => email, :password => password, :password_confirmation => password)
    end
    it "should be able to save an owner by passing a user object" do
      trail = Trail.create!(:owner => @user)
      trail.reload
      trail.owner.should == @user
    end
    it "should add the owner to the users by passing a user object" do
      trail = Trail.create!(:owner => @user)
      trail.reload
      trail.users.should include @user
    end

    it "should be able to save an owner by passing a user object" do
      trail = Trail.create!(:owner => @user.id)
      trail.reload
      trail.owner.should == @user
    end
    it "should add the owner to the users by passing a user object" do
      trail = Trail.create!(:owner => @user.id)
      trail.reload
      trail.users.should include @user
    end

  end
end