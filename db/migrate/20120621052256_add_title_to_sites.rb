class AddTitleToSites < ActiveRecord::Migration
  def up
    add_column :sites, :title, :text
  end

  def down
    remove_column :sites, :title
  end
end
