class Note < ActiveRecord::Base
  belongs_to :site
  default_scope order('position ASC')
  after_create :set_position


  def set_position
    self.position = self.site.notes.length-1
    self.save!()
  end
end
