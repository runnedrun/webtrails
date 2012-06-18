Proto1::Application.routes.draw do
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

  resources :user_sessions

  root :to => "user_sessions#new"
  match 'login' => "user_sessions#new",      :as => :login
  match 'logout' => "user_sessions#destroy", :as => :logout
  match 'create_user' => "users#create"
  match 'new_user' => "users#new"
  match 'new_trail' => "trails#new"
  match 'create_trail' => "trails#create"
  #match 'create_site' => "sites#create"
  resources :sites, :only=>[:create]
  match '/sites', :controller => 'sites', :action => 'options', :constraints => {:method => 'OPTIONS'}

  resources :notes, :only=>[:create]
  match '/notes', :controller => 'notes', :action => 'options', :constraints => {:method => 'OPTIONS'}

  match "/bookmarklet_js", :controller => 'bookmarklets', :action => "get_js"
  match '/bookmarklet_js', :controller => 'bookmarklets', :action => 'options', :constraints => {:method => 'OPTIONS'}


end
