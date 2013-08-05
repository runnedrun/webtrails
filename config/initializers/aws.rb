require 'aws/core/http/em_http_handler'

AWS.config({
               :access_key_id => 'AKIAILFUYRRIPYEI2ZRA',
               :secret_access_key => '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',
               :http_handler => AWS::Http::EMHttpHandler.new(
                   :pool_size => 0,   # Default is 0, set to > 0 to enable pooling
                   :async => false)   # If set to true all requests are handle asynchronously
                                       # and initially return nil
})

