class AddAuthenticationTokenToUsers < ActiveRecord::Migration
  def change
    add_column :users, :wt_authentication_token, :string
  end
end
