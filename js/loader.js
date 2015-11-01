
System.pushLog( "Recognised types:" );
System.pushLog( "<br />" );

var buffer = [];
for (var mime in formats)
{
	if( typeof formats[mime].parser !== 'undefined' )
		buffer.push( "<tr><td><strong>" +mime+ "</strong></td><td>" +formats[mime].description+ "</td></tr>\n" );
}
System.pushLog( "<table>" +buffer.join( "" )+ "</table>" );

System.pushLog( "<br />" );
System.pushLog( "Nothing to do (yet?)..." );