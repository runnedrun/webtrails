require "spec_helper"

describe BookmarkletsController do
  describe "the get_js method" do
    it "should return the js file" do
      get :get_js
      response.format.should == "js"
    end
  end
end