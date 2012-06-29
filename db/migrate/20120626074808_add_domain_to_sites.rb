class AddDomainToSites < ActiveRecord::Migration
  def up
    add_column :sites, :domain, :string
  end

  def down
    remove_column :sites, :domain
  end
end
