class AddWhitelistedToUsers < ActiveRecord::Migration
  def change
    add_column :users, :whitelisted, :boolean
  end
end
