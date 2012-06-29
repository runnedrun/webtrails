#makes trails for the user with ID = 4, at this time a@a.com, psswrd 123456

user = User.find(4)
urls = ["www.google.com",
    "en.wikipedia.org/wiki/Star_trek",
    "en.wikipedia.org/wiki/Spock",
]

(1..4).each do |i|
  sites = []
  urls.each do |url|
    sites.push(Site.create!(:url => "http://"+ url))
  end
  Trail.create!(:name => "Star Trek Trail " + i.to_s, :owner => 4, :sites => sites)
end
