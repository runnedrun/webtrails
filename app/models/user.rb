class User < ActiveRecord::Base
  acts_as_authentic do |c|
  end
  has_and_belongs_to_many :trails
  def owned_trails
    self.trails.where(:owner_id=>self.id)
  end
end
