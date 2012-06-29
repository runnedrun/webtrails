class AddScrollToNotes < ActiveRecord::Migration
  def up
    add_column :notes, :scroll_x, :integer
    add_column :notes, :scroll_y, :integer
  end

  def down
     remove_column :notes, :scroll_x
     remove_column :notes, :scroll_y
  end
end
