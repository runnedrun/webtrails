class AddPositionToSite < ActiveRecord::Migration
  def change
    add_column :sites, :position, :integer
  end
end
