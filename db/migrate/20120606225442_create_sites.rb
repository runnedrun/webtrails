class CreateSites < ActiveRecord::Migration
  def up
    create_table :sites do |t|
      t.text :url
      t.timestamps
    end
  end
  def down
    drop_table :sites
  end
end
