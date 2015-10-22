var CURRENT_VERSION = 1.0;

var output = [];
var parsers = {};

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
} else {
	pushError( "Sorry! Your browser does not support Javascript file uploads! This validator will not work without this feature." );
	pushLog( "This validator was tested with the Chrome browser." );
}


parsers['text/arff'] = function( data ) {
	var metadata = JSON.parse( findARFFComment( data, 0 ) );

	if( metadata === null ) {
		pushError( "Sorry, no metadata could be found in the supplied file!" );
		return;
	}

	pushLog( "JSON data parsed as..." );
	dumpJSON( metadata );

	var isValid = validateStructure( metadata );
	pushLog( "" );
	pushLog( "Validation results:" );
	if( isValid )
		pushReport( "Valid metadata!" );
	else
		pushError( "Invalid or missing metadata" );
}

function findARFFComment( data, start ) {
	var attempts = 30;
	var startIndex = typeof start !== 'undefined' ? start : 0;
	var endIndex = 0;
	while( startIndex != -1 && attempts-- > 0 )
	{
		startIndex = data.indexOf( "% meta", startIndex );
		if( startIndex > -1 ) {
			endIndex = data.indexOf( '\n', (startIndex+1) );
			return data.substring( startIndex+6, endIndex );
		}
	}
	return null;
}



parsers['text/xml'] = function( data ) {
	var metadata = JSON.parse(findXMLComment( data ));

	if( metadata === null ) {
		pushError( "Sorry, no metadata could be found in the supplied file!" );
		return;
	}

	pushLog( "JSON data parsed as..." );
	dumpJSON( metadata );

	var isValid = validateStructure( metadata );
	pushLog( "" );
	pushLog( "Validation results:" );
	if( isValid )
		pushReport( "Valid metadata!" );
	else
		pushError( "Invalid or missing metadata" );
}

function findXMLComment( data, start ) {
	var attempts = 30;
	var startIndex = typeof start !== 'undefined' ? start : 0;
	var endIndex = 0;
	while( startIndex != -1 && attempts-- > 0 )
	{
		startIndex = data.indexOf( "<!-- meta", startIndex );
		if( startIndex > -1 ) {
			endIndex = data.indexOf( "-->", (startIndex+1) );
			
			return data.substring( startIndex+9, endIndex );
		}
	}
	return null;
}



parsers['application/json'] = function( data ) {
	var metadata = JSON.parse( data );

	if( typeof metadata.meta === 'undefined' ) {
		pushError( "JSON was valid, but had no 'meta' object in the top-level object!" );
		return;
	} else {
		metadata = metadata.meta;
	}
	
	pushLog( "JSON data parsed as..." );
	dumpJSON( metadata );

	var isValid = validateStructure( metadata );
	pushLog( "" );
	pushLog( "Validation results:" );
	if( isValid )
		pushReport( "Valid metadata!" );
	else
		pushError( "Invalid or missing metadata" );
};


function validateStructure( json ) {
	var status = true;
	if( typeof json.version === 'undefined' ) {
		pushWarning( "An explicit version value was not found, using the latest version (", CURRENT_VERSION, ")" );
		status = false;
	} else {
		pushReport( "Version present! Checking against version", json.version, "rules" );
	}

	if( typeof json.encoding === 'undefined' ) {
		pushError( "Missing 'encoding' field!" );
		status = false;
	}

	if( typeof json.mime === 'undefined' ) {
		pushError( "Missing 'mime' field!" );
		status = false;
	} else {
		if( mimetypes[json.mime] )
			pushReport( "Mime type present, and read as '", json.mime, "', aka. <a href='"+mimetypes[json.mime].link+"'>", mimetypes[json.mime].description, "</a>" );
		else
			pushError( "Mime type present, but not a recognised type! (", json.mime, ")" );
	}

	return status;
}

function dumpJSON( json, prefix ) {
	prefix = typeof prefix !== 'undefined' ? prefix : "";
	var value;
	for(var name in json) {
		value = json[name];

		if( typeof value === 'object' ) {
			pushLog( prefix, name, "{" );
			dumpJSON( value, prefix+"&nbsp;&nbsp;&nbsp;" );
			pushLog( prefix, "}" );
		} else {
			pushLog( prefix, name, ":", value );
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

function pushLog() {
	var args = argumentsToArray( arguments );
	output.push( '<li>', args.join(' '), '</li>' );
	document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function pushWarning() {
	var args = argumentsToArray( arguments );
	output.push( '<li><warning>', args.join(' '), '<img src="img/attention-64.png" class="icon" /></warning></li>' );
	document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function pushError() {
	var args = argumentsToArray( arguments );
	output.push( '<li><error>', args.join(' '), '<img src="img/cancel-64.png" class="icon" /></error></li>' );
	document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function pushReport() {
	var args = argumentsToArray( arguments );
	output.push( '<li><report>', args.join(' '), '<img src="img/checked-64.png" class="icon" /></report></li>' );
	document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object
	output = [];

	// files is a FileList of File objects. List some properties.
	for (var i = 0, f; f = files[i]; i++) {
		pushLog('<strong>' +escape(f.name)+ '</strong> (' +(f.type || 'n/a')+ ') - '
				+f.size+ ' bytes, last modified: '
				+(f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a') );

		var reader = new FileReader();

		reader.onerror = function( evt ) {
			switch(evt.target.error.code) {
				case evt.target.error.NOT_FOUND_ERR:
					pushLog( "<strong>File not found - sorry!</strong>" );
					break;
				case evt.target.error.NOT_READABLE_ERR:
					pushLog( "<strong>File cannot be read - sorry!</strong>" );
					break;
				case evt.target.error.ABORT_ERR:
					pushLog( "<strong>File read aborted.</strong>" );
					break; // noop
				default:
					pushLog( "<strong>Error reading file - sorry!</strong>" );
			};
		}

		reader.onload = (function(_f) {
			var file = _f;
			return function( e ) {
				var buffer = reader.result;
				var type = file.type;

				// Attempt to handle 'unknown' mime types
				if( type.length == 0 )
				{
					if( file.name.toLowerCase().endsWith( ".arff" ) )
						type = "text/arff";
				}

				if( parsers[type] )
					parsers[type]( buffer );
				else {
					pushLog( "<error>Sorry! I don't understand that file type (", type, ")!</error>" );
					pushLog( "Currently this validator supports:" );
					for(var mime in parsers) {
						pushLog( "&nbsp;&nbsp;&nbsp", "--", mime );
					}
				}
			};
		})(f);

		var blob = f.slice( 0, 4096 );
		reader.readAsText( blob, "UTF-8" );
	}
}

pushLog( "Nothing to do (yet?)..." );
document.getElementById('files').addEventListener('change', handleFileSelect, false);
