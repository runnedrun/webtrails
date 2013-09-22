class AddSiteRevisionNumberToNotes < ActiveRecord::Migration
  def change
    add_column :notes, :site_revision_number, :integer
  end
end
