class TrailsController < ApplicationController

  def new

  end

  def create
    begin
      trail = Trail.create!(params[:trail])
      for site in params[:sites]
        trail.build_site_with_notes(site)
      end
      render :nothing => true, :status =>200
    #rescue
      #render :nothing => true, :status => 500
    end
  end

  def update

  end

end