class Trail < ActiveRecord::Base
  has_many :sites
  has_and_belongs_to_many :users
  def owner=(user)
    self.owner_id = user.id
    self.users << user
    self.save
  end
  def owner
    if self.owner_id
      User.find(self.owner_id)
    else
      nil
    end
  end
end