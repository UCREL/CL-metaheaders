const fs = require( "fs" );
const META_REGEX = new RegExp( "%\\s*!meta\\s+(\\{.*})" );

function read( target, callback ) {
	var lineReader = require( 'readline' ).createInterface({
		input: require( 'fs' ).createReadStream( target )
	});

	var found = false;

	lineReader.on( 'line', ( line ) => {
		try {
			var result = META_REGEX.exec( line );
			if( result !== null ) {
				var meta = JSON.parse( result[1] );

				found = true;
				return callback( null, meta, null );
			}
		}
		catch( err ) {
			console.log( err );
		}
	});

	lineReader.on( 'close', () => {
		if( !found )
			callback( null, null, null );
	});
}

function write( target, newMeta, callback ) {
}




module.exports = {
	"read": read,
	"write": write
};