class AddTitleToSites < ActiveRecord::Migration
  def up
    add_column :sites, :title, :string
  end

  def down
    remove_column :sites, :title
  end
end
