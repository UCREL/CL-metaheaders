module.exports = {};

module.exports.tei = require( "./xml.js" );
module.exports.xml = require( "./xml.js" );
module.exports.json = require( "./json.js" );
module.exports.js = require( "./json.js" );

module.exports._guess = ( target ) => {
	const Path = require( "path" );
	var ext = Path.extname( target );

	if( ext.startsWith(".") );
		ext = ext.substr( 1 );

	if( module.exports[ext] !== undefined ) {
		console.log( `Meta is reading this file in ${ext.toUpperCase()} mode` );
		return module.exports[ext];
	}

	return {
		"read": () => { console.log("META", "Unknown file type, STOP."); },
		"write": () => { console.log("META", "Unknown file type, STOP."); }
	}
};