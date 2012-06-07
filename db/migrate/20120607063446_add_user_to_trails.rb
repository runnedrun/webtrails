class AddUserToTrails < ActiveRecord::Migration
  def up
    create_table :trails_users do |t|
      t.integer :trail_id
      t.integer :user_id
    end
    add_column :trails, :owner_id, :integer
  end
  def down
    drop_table :trails_users
    remove_column :trails, :owner_id
  end
end
