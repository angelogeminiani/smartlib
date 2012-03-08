/* sf-lib.js 0.2
 * A script-loader that handles caching scripts in localStorage
 * where supported.
 * 
 * Note:
 *  - Debug is not possible with firebugs or other tools because code is invisible.
 *      This is a good feature if you want protect your code.
 * 
 * Credits: Gian Angelo Geminiani.
 * Copyright (c) 2012 Gian Angelo Geminiani;
 * 
 * Licensed MIT, GPL
 */
;(function (window, document) {
    
    // ------------------------------------------------------------------------
    //                      Constants
    // ------------------------------------------------------------------------
    
    var STORAGE_PREFIX = "sf-lib-"
    ;
    
    // ------------------------------------------------------------------------
    //                      Global
    // ------------------------------------------------------------------------
    
    var script_flags = {}
    , USE_STORAGE = localStorage && null!=localStorage.getItem
    , VERSION = '[RT-VERSION]' // setted from external compiler
    , CACHE_VERSION = USE_STORAGE ? localStorage.getItem(STORAGE_PREFIX + 'VERSION') : null
    , CACHE_ENABLED = true
    ;
    
    //-- overwrite cache version with current RT version--//
    setVersion(VERSION);
    
    // ------------------------------------------------------------------------
    //                      Utility
    // ------------------------------------------------------------------------
    
    function setVersion(ver){
        if(USE_STORAGE){
            localStorage.setItem(STORAGE_PREFIX + 'VERSION', ver);
        }
    }
    
    function isFunction(func){
        return Object.prototype.toString.call(func) == '[object Function]';
    }
    
    function replaceAll(text, searchfor, replacetext) {
        if (text && (typeof(text) === "string")) {
            var regexp = new RegExp(searchfor, 'g');
            return text.replace(regexp, replacetext);
        }
        return '';
    }
    
    function hasText(text) {
        return text ? text.toString().trim().length > 0 : false;
    }

    function endsWith(/* text to check */text, /* end string */str) {
        return (text.lastIndexOf(str || '') === text.length - (str ? str.length : 1));
    }

    function getKey(uri) {
        var result = replaceAll(uri, '/', ' ').trim();
        return STORAGE_PREFIX + replaceAll(result, ' ', '_');
    }
    
    function extend(target, source){
        var name, copy;
        if(source){
            for ( name in source ) {
                copy = source[ name ];
                if ( copy !== undefined ) {
                    target[ name ] = copy;
                }
            }
        }
    }
    
    function injectScript (text, opt_attr) {
        if(hasText(text)){
            var script = document.createElement("script"),
            head = document.head || document.getElementsByTagName("head")[0];

            //script.defer = 'defer';
            script.appendChild(document.createTextNode(text));
            
            extend(script, opt_attr);
            
            head.appendChild(script);
        }
    }
    
    function injectStyle (text, opt_attr) {
        if(hasText(text)){
            var script = document.createElement("style"),
            head = document.head || document.getElementsByTagName("head")[0];

            //script.defer = 'defer';
            script.appendChild(document.createTextNode(text));
            
            extend(script, opt_attr);
            
            head.appendChild(script);
        }
    }
    
    function injectStyleLink (url, opt_attr) {
        // <link type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/redmond/jquery-ui.css" rel="Stylesheet" />
        var head = document.head || document.getElementsByTagName("head")[0],
        link = document.createElement('link');
        link.type = 'text/css';
        link.href = url;
        link.rel = 'Stylesheet';
        
        extend(link, opt_attr);
        
        head.appendChild(link);
    }
    
    function injectScriptLink(url, opt_attr) {
        var head = document.head || document.getElementsByTagName("head")[0],
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        extend(script, opt_attr);

        head.appendChild(script);

        // remove from the dom (avoid duplicates)
        //head.removeChild(comp.lastChild);
    }
    
    function inject(uri, text, opt_attr){
        if(endsWith(uri, '.js')){
            injectScript(text, opt_attr);
        } else if (endsWith(uri, '.css')){
            injectStyleLink(uri, opt_attr);
        } else {
            injectStyleLink(uri, opt_attr);
        }
    }
    
    function injectLink(uri, opt_attr){
        if(endsWith(uri, '.js')){
            injectScriptLink(uri, opt_attr);
        } else if (endsWith(uri, '.css')){
            injectStyleLink(uri, opt_attr);
        } else {
            injectStyleLink(uri, opt_attr);
        }
    }
    
    function getUrl(url, callback) {
        var xhr = new XMLHttpRequest(),
        async = isFunction(callback);
        xhr.open("GET", url, async);
        if(async){
            xhr.onreadystatechange = function (e) {
                if (xhr.readyState === 4) {
                    callback(xhr.responseText);
                }
            };
        }
        xhr.send();
        return xhr.responseText;
    }
    // ------------------------------------------------------------------------
    //                      SFlibLoader
    // ------------------------------------------------------------------------
    
    function SFlibLoader(key, uri, opt_attr) {
        var self = this;
        
        self._uri = uri ;
        self._key = key; // file key
        self._external = self._uri.indexOf('http') === 0;
        self._attr = opt_attr;
    }

    SFlibLoader.prototype.load = function (){
        var self = this;
        
        //-- retrieve data --//
        if(self._external){
            injectLink(self._uri, self._attr);
        } else {
            var text = null;
            if(CACHE_ENABLED && USE_STORAGE){
                text = localStorage.getItem(STORAGE_PREFIX + self._key);
                var valid = text && (CACHE_VERSION===VERSION);
                if(!valid){
                    // retrieve text and store into cache
                    text = getUrl(self._uri);
                    localStorage.setItem(STORAGE_PREFIX + self._key, text||'');
                }
            } else {
                text = getUrl(self._uri);
            }
            if(hasText(text)){
                inject(self._uri, text, self._attr);
            }
        }
    };
    
    // ------------------------------------------------------------------------
    //                      SFlib
    // ------------------------------------------------------------------------
    
    function SFlib() {
        var self = this;
        self._currentloader = null;
    }
    
    /**
     * Load library or css synchronous
     * @param uri {string}
     * @param opt_attr {object} Optional attributes to pass to generated html entity
     **/
    SFlib.prototype.require = function require (uri, opt_attr) {
        var self = this,
        key = getKey(uri);
        
        if(!script_flags[key]){
            script_flags[key]=true;
            self._currentloader = new SFlibLoader(key, uri, opt_attr);
            self._currentloader.load();
        }

        return this;
    };

    /**
     * Mark uri as loaded.
     **/
    SFlib.prototype.loaded = function loaded (uri) {
        var key = getKey(uri);
        
        if(!script_flags[key]){
            script_flags[key]=true;
        }

        return this;
    };
    
    /**
     * Check if uri was already loaded.
     **/
    SFlib.prototype.exists = function exists(uri) {
        var key = getKey(uri);
        return !!script_flags[key];
    };

    /**
     * Set manually the version.
     */
    SFlib.prototype.version = function version (ver) {
        if(hasText(ver)){
            VERSION = ver;
            setVersion(VERSION);
        }
        return VERSION;
    };
    
    /**
     * Enable/Disable cache. 
     */
    SFlib.prototype.cache = function cache (value) {
        CACHE_ENABLED = !!value;
        return CACHE_ENABLED;
    };
    
    // ------------------------------------------------------------------------
    //                      Exports
    // ------------------------------------------------------------------------
    
    window["SFlib"] = new SFlib();
    
    
})(this, document);