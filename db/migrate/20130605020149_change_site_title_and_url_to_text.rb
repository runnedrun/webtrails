class ChangeSiteTitleAndUrlToText < ActiveRecord::Migration
  def up
    change_column :sites, :url, :text
    change_column :sites, :title, :text
  end

  def down
    change_column :sites, :url, :string
    change_column :sites, :title, :string
  end
end
