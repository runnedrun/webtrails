class CreateNotes < ActiveRecord::Migration
  def up
    create_table :notes do |t|
      t.text :content
      t.integer :site_id
      t.timestamps
    end
  end

  def down
    drop_table :notes
  end
end
