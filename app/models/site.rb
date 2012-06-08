class Site < ActiveRecord::Base
  has_many :notes
  belongs_to :trail
end
