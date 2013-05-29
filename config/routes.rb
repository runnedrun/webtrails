Webtrails::Application.routes.draw do
  devise_for :users, :controllers => { :omniauth_callbacks => "omniauth_callbacks" }


  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'

  root :to => "trails", :action => "index"
  resources :trails, :only => [:create, :show, :new, :index]
  match "trail/site_list", :controller => "trails", :action => "site_list"
  match 'trail/site_list', :controller => 'trails', :action => 'options', :constraints => {:method => 'OPTIONS'}

  match 'users/new', :controller => 'users', :action => "new"

  resources :sites, :only=>[:create,:show]
  match '/sites', :controller => 'sites', :action => 'options', :constraints => {:method => 'OPTIONS'}
  match '/async_site_load', :controller => 'sites', :action => 'async_site_load'
  match '/site/exists', :controller => 'sites', :action => 'options', :constraints => {:method => 'OPTIONS'}
  match '/site/exists', :controller => 'sites', :action => 'exists'
  match '/sites/delete', :controller => "sites", :action => 'delete', :constraints => {:method => 'POST'}

  resources :notes, :only=>[:create]
  match '/notes', :controller => 'notes', :action => 'options', :constraints => {:method => 'OPTIONS'}
  match '/notes/delete', :controller => "notes", :action => 'delete', :constraints => {:method => 'POST'}

  match "/bookmarklet_js", :controller => 'bookmarklets', :action => "get_js"
  match '/bookmarklet_js', :controller => 'bookmarklets', :action => 'options', :constraints => {:method => 'OPTIONS'}


end
