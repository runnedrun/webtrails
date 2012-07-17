class AddHtmlEncodingToSites < ActiveRecord::Migration
  def up
    add_column :sites, :html_encoding, :string
  end

  def down
    remove_column :sites, :html_encoding
  end
end
