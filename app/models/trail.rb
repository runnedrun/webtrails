class Trail < ActiveRecord::Base
  has_many :sites, :dependent => :destroy, :autosave => true
  has_and_belongs_to_many :users

  def owner=(user)
    if (user.class != User)
      self.owner_id = user
      self.users << User.find(user)
      self.save
    else
      self.owner_id = user.id
      self.users << user
      self.save
    end
  end

  def owner
    if self.owner_id
      User.find(self.owner_id)
    end
  end

  def update_site_list(site_array)
    sites = []
    all_authorized = true
    owner_id = self.owner_id
    site_array.each_with_index do |site_id,index|
      position = index
      site = Site.find(site_id)
      puts site.user_id
      puts owner_id
      if site and (site.user_id == owner_id)
        site.position = position.to_i
        site.trail = self
        sites.push(site)
      else
        all_authorized = false
        puts "a site did not exist or was not owned by the user"
      end
    end

    sites.each(&:save!) if all_authorized
    return all_authorized
  end

  def build_site_with_notes(attrs)
    note_attrs = attrs.delete(:notes) or attrs.delete("notes")
    site_attrs = attrs
    if note_attrs.class != String


      note_array = note_attrs.values.inject([]) do |note_array, note|
        note_array << Note.create!(note)
       end

      site_attrs.merge!({:notes => note_array})

    end
    site_attrs.merge!({:trail_id => self.id})
    site = Site.create!(site_attrs)
  end

  def site_list
    self.sites.map(&:id)
  end

end