const cookieParser = require( "cookie-parser"  )
const User = require( "../classes/User" );

module.exports = async function( req, res, next ) {

    try {

        const { iLoveYou } = req.cookies;

        if ( iLoveYou ) {

            const sessionID = cookieParser
                .signedCookie( iLoveYou, process.env.SESSION_SECRET )
                .toString();

            if ( sessionID ) {

                const user = await new User( req.app.get( "BDD" ).getBDD( ) ).FindSession( sessionID );

                if ( user.length ) {
                    req.session.user = user[ 0 ];
                    return next( );
                }

            }

            return res.redirect( "/login" );

        }


    } catch ( error ) {

        console.error( error );
        return res.status( 500 ).send( "Internal server error" );

    }

}