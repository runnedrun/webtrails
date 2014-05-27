class Note < ActiveRecord::Base
  belongs_to :site
  default_scope order('position ASC')
  after_create :set_position


  def set_position
    self.position = self.site.notes.length-1
    self.save!()
  end

  def delete_note_revision_from_site
    self.site.remove_revision(self.site_revision_number)
    self.site.save
  end

  def get_update_hash()
    {
        :clientSideId => self.client_side_id,
        :comment => self.comment,
        :content => self.content,
        :id => self.id,
        :scrollX => self.scroll_x,
        :scrollY => self.scroll_y,
        :siteRevisionNumber => self.site_revision_number
    }
  end

end
