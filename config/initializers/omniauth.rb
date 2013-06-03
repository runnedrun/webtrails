Rails.application.config.middleware.use OmniAuth::Builder do
  #http://www.google.com/robots.txt
  puts "starting up omniauth"
  puts ENV["GOOGLE_KEY"]
  puts ENV["GOOGLE_SECRET"]
  provider :google_oauth2, ENV["GOOGLE_KEY"], ENV["GOOGLE_SECRET"],
           {
               :scope => "userinfo.email,userinfo.profile",
               :approval_prompt => "auto"
           }
end