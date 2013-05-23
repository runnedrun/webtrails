#WebTrails
##Annotate a trail of websites to explain or research a topic

* Take notes faster
* Explain your research
* Annotations help you remember and others understand

Blaze a Trail soon at [http://webtrails.co/](http://webtrails.co/)



# Getting it running
1. run PostGres by launching the application. This will open their website and run PG.
2. Get thin, then run: `thin start` in the console
3. run in console: `rake jobs:work`. We use [delayed job](https://github.com/collectiveidea/delayed_job) for queuing
4. load the unpacked extension in app/views/bookmarklet/chrome_extension in [chrome://extensions/](chrome://extensions/)



