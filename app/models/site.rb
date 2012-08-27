class Site < ActiveRecord::Base
  has_many :notes, :dependent => :delete_all
  belongs_to :trail

  def self.save_site_to_aws(html,url, trail_id, shallow_save,site_id)
    remote = RemoteDocument.new(url,html)
    path = "/" + trail_id
    remote.mirror(path,shallow_save)

    site = Site.find(site_id)
    site.update_attributes({:archive_location => remote.asset_path.to_s, :html_encoding => remote.encoding})
  end

  def build_notes(attrs)
    if attrs.class != String
      note_array = attrs.values.inject([]) do |note_array, note|
        note.merge!(:site_id => self.id)
        Note.create!(note)
      end
    end
  end

  include WebDownloader

end
