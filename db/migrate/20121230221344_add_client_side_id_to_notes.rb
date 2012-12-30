class AddClientSideIdToNotes < ActiveRecord::Migration
  def up
    add_column :notes, :client_side_id, :string
  end
  def down
    remove_column :notes, :client_side_id
  end
end
