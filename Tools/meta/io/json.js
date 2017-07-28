const fs = require( "fs" );


function read( target, callback ) {
	fs.readFile( target, "utf8", (err, contents) => {
		var extra = {};
		if( err )
			return callback( err, null, null );

		try {
			var json = JSON.parse( contents );
			extra.json = json;

			if( json.__meta__ !== undefined ) {
				extra.key = "__meta__";
				return callback( null, json.__meta__, extra );
			}

			if( json.meta !== undefined ) {
				extra.key = "meta";
				return callback( null, json.meta, extra );
			}

			return callback( null, null, extra ); // Return null if valid JSON, but no metablock is present
		} catch( e ) {
			return callback( e, null, null );
		}
	} );
}

function write( target, newMeta, callback ) {
	console.log( "Target", target );
	read( target, (err, oldMeta, extra) => {
		if( err )
			return callback( err );

		var key = "__meta__";
		if( oldMeta !== null ) // Steal the existing key, if it exists
			key = extra.key;

		var json = extra.json;
		json[key] = newMeta;
		
		fs.writeFile( target, JSON.stringify( json, null, '\t' ), "utf8", (err) => {
			return callback( err );
		});

	} );
}




module.exports = {
	"read": read,
	"write": write
};