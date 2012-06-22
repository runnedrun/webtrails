class TrailsController < ApplicationController

  before_filter :authenticated_or_redirect, :only => [:index, :show]

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
    end
  end

  def show

  end

  def index
    @trails = current_user.trails
  end

end