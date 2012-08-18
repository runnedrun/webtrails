class AddCommentLocationToNotes < ActiveRecord::Migration
  def up
    add_column :notes, :comment_location_x, :integer
    add_column :notes, :comment_location_y, :integer
  end

  def down
    remove_column :notes, :comment_location_x
    remove_column :notes, :comment_location_y
  end
end
