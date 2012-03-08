# Smart Lib
      
  Smart Lib (sf-lib.js) is a stand-alone script-loader that handles caching scripts in localStorage where supported.
  Try it here at Smart Lib [test page](http://www.smartfeeling.org/test/sf-lib/sf-lib.html).
  

## Quick Start

Please, visit [SmartLib site](http://www.smartfeeling.org/smartlib)
for more details and news.
	
Start with SmartLib is very easy:

	1) Add sf-lib.js to your HTML page.
	
	<script type="text/javascript" src="sf-lib.js"></script> 

	2) Use it in a <script> tag.
	
	<script>
            SFlib.require('./lib/vendor/jquery-1.7.1.js');
            
            SFlib.require('http://fonts.googleapis.com/css?family=Nobile:regular,italic,bold&amp;subset=latin', {'media':'only screen'});
            
            // test jQuery
            $(function(){
                $('#test').html('Success! all libraries are loaded');
            });
    </script>
	
