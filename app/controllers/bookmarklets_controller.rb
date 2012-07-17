class BookmarkletsController < ApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:get_js]
  after_filter :cors_set_access_control_headers

  def cors_set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    headers['Access-Control-Max-Age'] = "1728000"
  end

  def cors_preflight_check
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-Prototype-Version'
    headers['Access-Control-Max-Age'] = '1728000'
  end

  def options
    cors_preflight_check
    render :text => '', :content_type => 'text/plain'
  end


  def get_js

    if ENV["RAILS_ENV"] == "development"
      render :js => File.open(File.dirname(__FILE__) + "/../views/bookmarklet/whereJSisWrittenLocal.js").read()
    elsif ENV["RAILS_ENV"] == "production"
      render :js => File.open(File.dirname(__FILE__) + "/../views/bookmarklet/whereJSisWrittenProduction.js").read()
    end

  end

end