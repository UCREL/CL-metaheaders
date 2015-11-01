var CURRENT_VERSION = 1.0;

var output = [];
var formats = {};

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
} else {
	System.pushError( "Sorry! Your browser does not support Javascript file uploads! This validator will not work without this feature." );
	System.pushLog( "This validator was tested with the Chrome browser." );
}

// Extend the object prototype so we can pseudo-copy functions
Object.prototype.extend = function(obj) {
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) {
			this[i] = obj[i];
		}
	}
};


function validateStructure( json ) {
	var status = true;
	if( typeof json.version === 'undefined' ) {
		System.pushWarning( "An explicit version value was not found, using the latest version (", CURRENT_VERSION, ")" );
		status = false;
	} else {
		System.pushReport( "Version present! Checking against version", json.version, "rules" );
	}

	if( typeof json.encoding === 'undefined' ) {
		System.pushError( "Missing 'encoding' field!" );
		status = false;
	}

	if( typeof json.mime === 'undefined' ) {
		System.pushError( "Missing 'mime' field!" );
		status = false;
	} else {
		if( formats[json.mime] )
			System.pushReport( "Mime type present, and read as '", json.mime, "', aka. <a href='"+formats[json.mime].link+"'>", formats[json.mime].description, "</a>" );
		else
			System.pushError( "Mime type present, but not a recognised type! (", json.mime, ")" );
	}

	return status;
}


function dumpJSON( json, prefix ) {
	prefix = typeof prefix !== 'undefined' ? prefix : "";
	var value;
	for(var name in json) {
		value = json[name];

		if( typeof value === 'object' ) {
			System.pushLog( prefix, name, "{" );
			dumpJSON( value, prefix+"&nbsp;&nbsp;&nbsp;" );
			System.pushLog( prefix, "}" );
		} else {
			System.pushLog( prefix, name, ":", value );
		}
	}
}

function escapeHTML(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function argumentsToArray(args) {
	return [].slice.apply(args);
}

var System = {
	pushLog: function() {
		var args = argumentsToArray( arguments );
		output.push( '<li>', args.join(' '), '</li>' );
		document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
	},

	pushWarning: function() {
		var args = argumentsToArray( arguments );
		output.push( '<li><warning>', args.join(' '), '<img src="img/attention-64.png" class="icon" /></warning></li>' );
		document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
	},

	pushError: function() {
		var args = argumentsToArray( arguments );
		output.push( '<li><error>', args.join(' '), '<img src="img/cancel-64.png" class="icon" /></error></li>' );
		document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
	},

	pushReport: function() {
		var args = argumentsToArray( arguments );
		output.push( '<li><report>', args.join(' '), '<img src="img/checked-64.png" class="icon" /></report></li>' );
		document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
	}
};

function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object
	output = [];

	// files is a FileList of File objects. List some properties.
	for (var i = 0, f; f = files[i]; i++) {
		System.pushLog('<strong>' +escape(f.name)+ '</strong> (' +(f.type || 'n/a')+ ') - '
				+f.size+ ' bytes, last modified: '
				+(f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a') );

		var reader = new FileReader();

		reader.onerror = function( evt ) {
			switch(evt.target.error.code) {
				case evt.target.error.NOT_FOUND_ERR:
					System.pushLog( "<strong>File not found - sorry!</strong>" );
					break;
				case evt.target.error.NOT_READABLE_ERR:
					System.pushLog( "<strong>File cannot be read - sorry!</strong>" );
					break;
				case evt.target.error.ABORT_ERR:
					System.pushLog( "<strong>File read aborted.</strong>" );
					break; // noop
				default:
					System.pushLog( "<strong>Error reading file - sorry!</strong>" );
			};
		}

		reader.onload = (function(_f) {
			var file = _f;
			return function( e ) {
				var buffer = reader.result;
				var type = file.type;

				// Attempt to handle 'unknown' mime types - this needs to be generified!
				if( type.length == 0 )
				{
					if( file.name.toLowerCase().endsWith( ".arff" ) )
						type = "text/arff";
				}

				if( formats[type] )
					formats[type].parser( buffer );
				else {
					System.pushLog( "<error>Sorry! I don't understand that file type (", type, ")!</error>" );
					System.pushLog( "Currently this validator supports:" );
					for(var mime in formats) {
						System.pushLog( "&nbsp;&nbsp;&nbsp", "--", mime );
					}
				}
			};
		})(f);

		var blob = f.slice( 0, 4096 );
		reader.readAsText( blob, "UTF-8" );
	}
}
document.getElementById('files').addEventListener('change', handleFileSelect, false);
