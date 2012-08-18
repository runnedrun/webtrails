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
    extra_modules = ["rangy-core"]
    compiled_modules = build_extra_modules(extra_modules)
    if ENV["RAILS_ENV"] == "development"
      jsFile = compiled_modules + File.open(File.dirname(__FILE__) + "/../views/bookmarklet/whereJSisWrittenLocal.js").read()

    elsif ENV["RAILS_ENV"] == "production"
      jsFile = compiled_modules + File.open(File.dirname(__FILE__) + "/../views/bookmarklet/whereJSisWrittenProduction.js").read()
    end
    render :js => jsFile
  end

  private

  def build_extra_modules(extra_modules)
    compiled_js = ""
    extra_modules.each do |extra_module|
      module_content = File.open(File.join(Rails.root,"app/assets/javascripts/"+extra_module+".js")).read()
      module_content +="\n;\n"
      compiled_js += module_content
    end
    return compiled_js
  end

end