class AddRevisionNumberToSites < ActiveRecord::Migration
  def change
    add_column :sites, :revision_numbers, :text, :default => ""
    add_column :sites, :base_revision_number, :integer
  end
end
