// ██████ Dependencies ████████████████████████████████████████████████████████

const cookieParser  = require( "cookie-parser"  )
    , express       = require( "express"        );

const { deserializeSession } = require( "../Utils/sessions" );

const router        = express.Router( );

const User = require( "./../classes/User" );

// —— Route index
router.get( "/", deserializeSession, ( req, res, next ) => {

    if ( req.session.user.admin ) {
        res.render( "admin", {
            user: req.session.user
        });
    } else {
        res.render( "random" );
    }

});

// —— login index
router.get( "/login", async ( req, res, next ) => {

    const { iLoveYou } = req.cookies;

    if ( iLoveYou ) {

        const sessionID = cookieParser
            .signedCookie( iLoveYou, process.env.SESSION_SECRET )
            .toString();

        if ( sessionID ) {

            const user = await new User( req.app.get( "BDD" ).getBDD( ) ).FindSession( sessionID );

            if ( user.length )
                return res.redirect( "/" );

        }

    }

    res.render( "login" );

});

router.post( "/login", async ( req, res, next ) => {


   try {

        const { email, password } = req.body;

        if ( !( email && password ) )
            return res.status( 418 ).send( "Email and password are required" );

        if ( !email )
            return res.status( 418 ).send( "Email required" );

        if ( !password )
            return res.status( 418 ).send( "Password required" );

        const user = await new User( req.app.get( "BDD" ).getBDD( ) );
        const resp = await user.ConnectUser( email, password );

        if ( !resp || !resp.length )
            return res.status( 418 ).send( "No users found with this login/password combination" );

        user.CreateSession( resp[ 0 ].IdUser, req.sessionID );
        req.session.user = resp[ 0 ];

        res.redirect( "/")

    } catch ( error ) {
        console.error( error )
    }

});

router.get( "/logout", async ( req, res, next ) => {

    try {

        const { iLoveYou } = req.cookies;

         if ( iLoveYou ) {

            const sessionID = cookieParser
                .signedCookie( iLoveYou, process.env.SESSION_SECRET )
                .toString();

            if ( sessionID ) {

                const user      = await new User( req.app.get( "BDD" ).getBDD( ) )
                const sessions  = await user.FindSession( sessionID );

                if ( sessions.length )
                    user.DeleteSession( sessionID );

            }

        }

        res.redirect( "./login" );

    } catch ( error ) {

        res.status( 418 ).send( error );
        console.error( error );

    }

});



module.exports = router;
