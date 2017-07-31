const fs = require( "fs" );


function read( target, callback ) {
	var lineReader = require( 'readline' ).createInterface({
		input: require( 'fs' ).createReadStream( target )
	});

	lineReader.on( 'line', ( line ) => {
		console.log( 'Line from file:', line );
	});
}

function write( target, newMeta, callback ) {
}




module.exports = {
	"read": read,
	"write": write
};