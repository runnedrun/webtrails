class Site < ActiveRecord::Base
  has_many :notes, :dependent => :delete_all
  belongs_to :trail

  def build_notes(attrs)
    if attrs.class != String
      note_array = attrs.values.inject([]) do |note_array, note|
        note.merge!(:site_id => self.id)
        Note.create!(note)
      end
    end
  end

end
