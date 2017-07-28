const fs = require( 'fs' );

//<!--([\s\S\n]*?)-->

function read( target, callback ) {
	fs.readFile( target, "utf8", (err, contents) => {
		if( err )
			return callback( err, null, null );

		var regex = new RegExp( "<!-- !meta(.*?)-->", 'mg' );

		var match;
		while( match = regex.exec(contents) ) {
			try {
				var meta = JSON.parse( match[1] );

				return callback( null, meta, null );
			} catch( err ) {
				return callback( err, null, null );
			}
		}

		return callback( null, null, null );
	} );
}

function write( target, meta, callback ) {
	fs.readFile( target, "utf8", (err, contents) => {
		if( err )
			return callback( err, null, null );

		// Do we already have a meta block to work with?
		read( target, (err, oldMeta) => {

			// Yup - do an in-place replace.
			if( oldMeta !== null ) {
				var regex = new RegExp( "<!-- !meta .*? -->", 'mg' );

				var metaTag = `<!-- !meta ${JSON.stringify(meta)} -->`;
				contents = contents.replace( regex, metaTag ); // Wipes the existing meta block!

				fs.writeFile( target, contents, "utf8", (err) => {
					if( err )
						return callback( err );

					return callback( null );
				} );

				return callback();
			}

			// Else Nope, prepend to the file.
			var metaTag = `<!-- !meta ${JSON.stringify(meta)} -->`;
			contents = `${metaTag}\n${contents}`;

			fs.writeFile( target, contents, "utf8", (err) => {
				if( err )
					return callback( err );

				return callback( null );
			} );
		} );
	} );
}

module.exports = {
	"read": read,
	"write": write
};