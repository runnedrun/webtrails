require "spec_helper"
#require "open-uri"

describe UsersController do
  render_views

  describe "the create through google method" do
    #this is stupid, after trying to mock open-uri open for 3 hours I'm done. I'm going to work on useful
    #stuff. Get back to this later.
    before do
      @user_count = User.count
      @email = Faker::Internet.email
      @password = Faker::Name.first_name

      @user_data_hash = {
          "id"=>"103585683622742280593",
          "email"=>"runnedrun@gmail.com",
          "verified_email"=>true,
          "name"=>"David Gaynor",
          "given_name"=>"David",
          "family_name"=>"Gaynor",
          "link"=>"https://plus.google.com/103585683622742280592",
          "picture"=>"https://lh4.googleusercontent.com/-PZYiUAsbAS4/AAAAAAAAAAI/AAAAAAAAAWs/Bp697ra-bt4/photo.jpg",
          "gender"=>"male", "birthday"=>"0000-08-02", "locale"=>"en"
      }

      @google_request_url = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token="

      @open_mock = double(Kernel)
      @response_mock = double(Hash)
      @response_mock.stub(:read) {@user_data_hash}
      #@open_mock.stub(:open).with(@google_request_url + "badtoken").and_raise("uri error")
      #@open_mock.stub(:open).with(@google_request_url + "goodtoken"){ @user_data_hash }
      @open_mock.stub(:open){ @response_mock }
      #Kernel.stubs(:open).yields(@response_mock)

      #@open_mock.stub(:read){ @user_data_hash }

      #User.any_instance.stub(:open) {"asdflksa"}

      puts @google_request_url + "goodtoken"

      @time_mock = double(Time)
      @time_mock.stub(:now) {100}

      @user_hash = {"auth_token" => "ya29.AHES6ZQddAJW7GgqTvukOXm3ho8CTu8KJbMo3D9DxWytTAOV",
                    "email" => "runnedrun@gmail.com",
                    "expires_on" => "2013-05-30T00:01:02Z",
                    "id" => 9,
                    "name" => "David",
                    "provider" => "google",
                    "uid" => "103585683622742280592"}

      @goodtoken = "goodtoken"
      @badtoken = "badtoken"
      @expired_time = 80
      @not_expired_time = 130
    end

    it "should retrieve the user information for a valid access token" do
      @open_mock.should_receive(:open).exactly(1).times do |args|
        $stderr.puts(args)
        return true
      end

      post :login_or_create_gmail_user, :access_token => @goodtoken, :expires_on => @not_expired_time
      puts response.body




      #JSON.parse(response.body)["auth_token"].should == @goodtoken
      #JSON.parse(response.body)["expires"].should == Time.at(@not_expired_time)
      #JSON.parse(response.body)["email"].should == @user_data_hash["email"]
      #JSON.parse(response.body)["uid"].should == @user_data_hash["id"]
    end

  end

  describe "the new method" do
    it "should render the new view" do
      get :new
      response.should render_template(:new)
    end

  end
end