// https://www.npmjs.com/package/open-graph

var request = require('request');
var http = require('http');
var https = require('https');
var cheerio = require('cheerio');
var Q = require('q');

var shorthandProperties = {
	"image": "image:url",
	"video": "video:url",
	"audio": "audio:url"
}

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

exports = module.exports = getOGData;

function getOGData (url, cb, options){
	exports.getHTML(url, function(err, html){
		if (err) return cb(err);
		
		cb(null, exports.parse(html, options));
	})
}


exports.getHTML = function(url, cb){
	var purl = require('url').parse(url);
	
	if (!purl.protocol)
		purl = require('url').parse("http://"+url);
	
	var httpModule = purl.protocol === 'https:'
		? https
		: http;
	
	url = require('url').format(purl);
	
	var client = httpModule.get(url, function(res){
		res.setEncoding('utf-8');
		
		var html = "";
		
		res.on('data', function(data){
			html += data;
		});
		
		res.on('end', function(){
			if (res.statusCode >= 300 && res.statusCode < 400)
			{
				exports.getHTML(res.headers.location, cb);
			}
			else
			{
				cb(null, html);
			}
			
		});
	});
	
	client.on('error', function(err){
		cb(err);
	})
}


exports.parse = function(html, options){
	options = options || {};
	
	var $ = cheerio.load(html);
	
	
	// Check for xml namespace
	var namespace,
		$html = $('html');
	
	if ($html.length)
	{
		var attribKeys = Object.keys($html[0].attribs);
		
		attribKeys.some(function(attrName){
			var attrValue = $html.attr(attrName);
			
			if (attrValue.toLowerCase() === 'http://opengraphprotocol.org/schema/'
				&& attrName.substring(0, 6) == 'xmlns:')
			{
				namespace = attrName.substring(6);
				return false;
			}
		})
	}
	else if (options.strict)
		return null;
	
	if (!namespace) 
		// If no namespace is explicitly set..
		if (options.strict)
			// and strict mode is specified, abort parse.
			return null;
		else
			// and strict mode is not specific, then default to "og"
			namespace = "og";
	
	var meta = {},
		metaTags = $('meta');
	
	metaTags.each(function() {
		var element = $(this);
			propertyAttr = element.attr('property');
		
		// If meta element isn't an "og:" property, skip it
		if (!propertyAttr || propertyAttr.substring(0, namespace.length) !== namespace)
			return;
		
		var property = propertyAttr.substring(namespace.length+1),
			content = element.attr('content');
		
		// If property is a shorthand for a longer property,
		// Use the full property
		property = shorthandProperties[property] || property;
		
		
		var key, tmp,
			ptr = meta,
			keys = property.split(':');

		// we want to leave one key to assign to so we always use references
		// as long as there's one key left, we're dealing with a sub-node and not a value

		while (keys.length > 1) {
			key = keys.shift();

			if (Array.isArray(ptr[key])) {
				// the last index of ptr[key] should become
				// the object we are examining.
				tmp = ptr[key].length-1;
				ptr = ptr[key];
				key = tmp;
			}

			if (typeof ptr[key] === 'string') {
				// if it's a string, convert it
				ptr[key] = { '': ptr[key] };
			} else if (ptr[key] === undefined) {
				// create a new key
				ptr[key] = {};
			}

			// move our pointer to the next subnode
			ptr = ptr[key];
		}

		// deal with the last key
		key = keys.shift();

		if (ptr[key] === undefined) {
			ptr[key] = content;
		} else if (Array.isArray(ptr[key])) {
			ptr[key].push(content);
		} else {
			ptr[key] = [ ptr[key], content ];
		}
	});
	
	return meta;
}

exports.getUrlTitle = function(url) {
  var defer = Q.defer();
  request(url, function(err, res, html) {
    if (err) {
      defer.reject(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      defer.resolve(title);
    }
  });
  return defer.promise;
},

exports.getUrlData = function(url) {
  var defer = Q.defer();

  exports.getHTML(url, function(err, html){
    if (err) {
      defer.reject(err);
    }

    var data = exports.parse(html);

    if (data.title) {
      defer.resolve(data);
    } else {
      exports.getUrlTitle(url)
        .then(function (title) {
          data.title = title;
          defer.resolve(data);
        });
    }
  });

  return defer.promise;
},

exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
}