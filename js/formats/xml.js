formats['text/xml'] = {
	"description":"Plain XML Format",
	"link":"http://www.w3.org/TR/REC-xml/",

	parser: function( data ) {
		var metadata = JSON.parse( this.findComment( data ));

		if( metadata === null ) {
			System.pushError( "Sorry, no metadata could be found in the supplied file!" );
			return;
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
	},

	findComment: function( data, start ) {
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
}

// Use the same parser for TEI, but as TEI is identified as XML by FileReader objects, this shouldn't be needed. Just included for completeness
formats['text/tei'] = {};
formats['text/tei'].extend( formats['text/xml'] );
formats['text/tei']["description"] = "TEI Format XML";
formats['text/tei']["link"]        = "http://www.tei-c.org/index.xml";