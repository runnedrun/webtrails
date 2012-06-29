class AddArchiveLocationToSite < ActiveRecord::Migration
  def up
    add_column :sites, :archive_location, :string
  end

  def down
    remove_column :sites, :archive_location
  end
end
