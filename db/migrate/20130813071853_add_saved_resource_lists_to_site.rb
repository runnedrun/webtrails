class AddSavedResourceListsToSite < ActiveRecord::Migration
  def change
    add_column :sites, :saved_resources, :text, :default => ""
    add_column :sites, :saved_stylesheets, :text, :default => ""
  end
end
