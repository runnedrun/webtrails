class Site < ActiveRecord::Base
  has_many :notes, :dependent => :delete_all
  belongs_to :trail
  belongs_to :user
  default_scope order('position ASC')
  after_create :set_position


  def update_html(html, revision_number)
    uri = URI(self.archive_location)
    bucket_location = uri.path.gsub(/(\/TrailsSitesProto\/)|(\/TrailsSitesProto)/,"")
    Fiber.new do
      EM.synchrony do
        begin
          puts "updating site html now"
          s3 = AWS::S3.new
          bucket = s3.buckets["TrailsSitesProto"]
          newFile = bucket.objects[File.join(bucket_location, revision_number.to_s).to_s]
          puts File.join(bucket_location, revision_number.to_s).to_s
          newFile.write(html)
          puts "done updating setting to public read"
          newFile.acl = :public_read
          puts "set to public read"
        rescue
          puts "had a problem updating the html for site: " + self.id
        end
      end
    end.resume
    self.add_revision(revision_number)
    self.save
  end

  def set_position
    self.position = self.trail.sites.length-1
    self.save!()
  end

  def add_to_resource_set(resource_array)
    new_resource_string = resource_array.to_a.join("|#|")
    existing_resource_string = self.saved_resources
    existing_resource_string += "|#|" if !existing_resource_string.empty?
    self.saved_resources = existing_resource_string + new_resource_string
    self.save!
  end

  def update_resource_set(resource_array)
    new_resource_string = resource_array.to_a.join("|#|")
    self.saved_resources = new_resource_string
    self.save!
  end

  def retrieve_resource_set
    return self.saved_resources.split("|#|").to_set
  end

  def add_revision(revision_number)
    self.revision_numbers = self.get_revisions.push(revision_number).join(",")
  end

  def get_revisions()
    rev_nums = self.revision_numbers
    if rev_nums
      rev_nums.split(",")
    else
      []
    end
  end

  def get_revision_urls()
    get_revisions.map do |revision|
      File.join(self.archive_location, revision.to_s)
    end
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

  def note_list()
    self.notes.map { |note| note.id.to_s }
  end

  def base_archive_location
    File.join([self.archive_location, self.base_revision_number.to_s])
  end

  def get_update_hash()
    {
        :baseRevisionNumber => self.base_revision_number,
        :revisionUrls => Hash[self.get_revisions.zip(self.get_revision_urls)],
        :html => {},
        :id => self.id,
        :notes => {
            :order => self.note_list,
            :noteObjects => Hash[self.notes.map{ |note| [note.id, note.get_update_hash] }]
        },
        :url => self.url
    }
  end

end
