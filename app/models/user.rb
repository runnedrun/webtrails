require("open-uri")

class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :omniauthable, :omniauth_providers => [:google_oauth2]

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me
  has_and_belongs_to_many :trails
  def owned_trails
    self.trails.where(:owner_id=>self.id)
  end

  def self.find_for_google_oauth2(access_token, signed_in_resource=nil)
    $stderr.puts("getting to the modle")
    data = get_user_info_from_google(access_token)
    puts data
    user = User.where(:email => data["email"]).first

    unless user
      user = User.create(name: data["name"],
                         email: data["email"],
                         password: Devise.friendly_token[0,20]
      )
    end

    user
  end

  def self.get_user_info_from_google(access_token)
    $stderr.puts "making request now!"
    url =  "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + URI::encode(access_token)
    puts url
    data = open(url)
    string = JSON.parse(data.read)
  end
end
