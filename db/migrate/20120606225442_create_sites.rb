class CreateSites < ActiveRecord::Migration
  def up
    create_table :sites do |t|
      t.string :url
      t.timestamps
    end
  end
  def down
    drop_table :sites
  end
end
