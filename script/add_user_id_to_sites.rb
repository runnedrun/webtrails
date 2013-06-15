all_sites = Site.all
all_sites.each do |site|
  trail = site.trail
  if trail
    user_id = trail.owner_id
    puts "settin user id to be " + user_id.to_s
    site.user_id = user_id
    site.save!
  else
    puts "no trail for this site"
  end
end
