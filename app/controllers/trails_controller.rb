class TrailsController < ApplicationController

  def new

  end

  def create
    begin
      trail = Trail.create!(params[:trail])
      if params[:sites].class != String
        for site in params[:sites].values
          trail.build_site_with_notes(site)
        end
      end
      render :json => {"id" => trail.id}, :status =>200
    #rescue
      #render :nothing => true, :status => 500
    end
  end

  def update

  end

end