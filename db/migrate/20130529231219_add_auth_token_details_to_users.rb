class AddAuthTokenDetailsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :auth_token, :string
    add_column :users, :expires_on, :datetime
  end
end
