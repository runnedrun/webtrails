require "spec_helper"

describe TrailsController do
  describe "the new action" do
    it "should render the new trails page" do
      get :new
      response.should render_template(:new)
    end
  end

end