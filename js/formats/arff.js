
formats['text/arff'] = {
	"description": "Attribute-Relation File Format (ARFF)",
	"link":"http://www.cs.waikato.ac.nz/ml/weka/arff.html",

	parser: function( data ) {
		var metadata = JSON.parse( this.findComment( data, 0 ) );

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
			startIndex = data.indexOf( "% meta", startIndex );
			if( startIndex > -1 ) {
				endIndex = data.indexOf( '\n', (startIndex+1) );
				return data.substring( startIndex+6, endIndex );
			}
		}
		return null;
	}
};