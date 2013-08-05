class Site < ActiveRecord::Base
  has_many :notes, :dependent => :delete_all
  belongs_to :trail
  belongs_to :user
  default_scope order('position ASC')
  after_create :set_position


  def self.save_site_to_aws(html,url, trail_id, shallow_save,site_id)

    #$stderr.puts "save_site_to_aws"
    #$stderr.puts "url: " + url
    #$stderr.puts "trail_id: "+ trail_id.to_s
    #$stderr.puts "shallow_save: "+ shallow_save.to_s
    #$stderr.puts "site_id: " + site_id.to_s
    #
    #remote = RemoteDocument.new(url,html)
    #path = "/" + trail_id.to_s + "/" + site_id.to_s
    #remote.mirror(path,shallow_save)
    #site = Site.find(site_id)
    #site.update_attributes({:archive_location => remote.asset_path.to_s, :html_encoding => remote.encoding})
  end

  def update_html(html)
    uri = URI(self.archive_location)
    bucket_location = uri.path.gsub(/(\/TrailsSitesProto\/)|(\/TrailsSitesProto)/,"")
    s3 = AWS::S3.new
    bucket = s3.buckets["TrailsSitesProto"]
    newFile = bucket.objects[bucket_location]
    newFile.write(html)
    newFile.acl = :public_read
  end

  def set_position
    self.position = self.trail.sites.length-1
    self.save!()
  end

  def update_note_list(note_array)
    notes = []
    all_authorized = true
    note_array.each_with_index do |note_id,index|
      position = index
      note = Note.find(note_id)
      if note and (note.site_id == self.id)
        note.position = position.to_i
        notes.push(note)
      else
        all_authorized = false
        puts "a site did not exist or was not owned by the user"
      end
    end
    notes.each(&:save!) if all_authorized
    return all_authorized
  end

  def build_notes(attrs)
    if attrs.class != String
      note_array = attrs.values.inject([]) do |note_array, note|
        note.merge!(:site_id => self.id)
        Note.create!(note)
      end
    end
  end
end
