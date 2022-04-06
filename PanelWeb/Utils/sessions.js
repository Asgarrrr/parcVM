
const cookieParser  = require( "cookie-parser" );
const User          = require( "../classes/User" );

async function deserializeSession( req, res, next ) {

    const { iLoveYou } = req.cookies;

    if ( !iLoveYou )
        return next();

    const sessionID = cookieParser
        .signedCookie( iLoveYou, process.env.SESSION_SECRET )
        .toString();

    if ( sessionID ) {

        const user = await new User( req.app.get( "BDD" ).getDB( ) ).FindSession( sessionID );

        if ( !user.length )
            return res.redirect( "/login" );

        req.session.user = user;

    }

    return next();

}

async function serializeSession( req, res, next ) {

}

module.exports = {
    deserializeSession,
    serializeSession
}