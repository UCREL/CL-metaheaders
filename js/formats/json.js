formats['application/json'] = {
	"description":"Plain JSON Format",
	"link":"http://json.org/",

	parser: function( data ) {
		var metadata = JSON.parse( data );

		if( typeof metadata.__meta__ === 'undefined' ) {
			System.pushError( "JSON was valid, but had no 'meta' object in the top-level object!" );
			return;
		} else {
			metadata = metadata.__meta__;
		}
		
		System.pushLog( "JSON data parsed as..." );
		dumpJSON( metadata );

		var isValid = validateStructure( metadata );
		System.pushLog( "" );
		System.pushLog( "Validation results:" );
		if( isValid )
			System.pushReport( "Valid metadata!" );
		else
			System.pushError( "Invalid or missing metadata" );
	}
};