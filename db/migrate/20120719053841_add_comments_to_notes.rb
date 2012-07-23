class AddCommentsToNotes < ActiveRecord::Migration
  def up
    add_column :notes, :comment, :text
  end

  def down
    remove_column :notes, :comment
  end
end
