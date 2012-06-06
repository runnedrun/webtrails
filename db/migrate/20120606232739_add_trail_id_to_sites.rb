class AddTrailIdToSites < ActiveRecord::Migration
  def up
    add_column :sites, :trail_id, :integer
  end
  def down
    remove_column :sites, :trail_id
  end
end
