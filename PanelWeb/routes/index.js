// ██████ Dependencies ████████████████████████████████████████████████████████

const cookieParser  = require( "cookie-parser"  )
    , express       = require( "express"        );

const { deserializeSession } = require( "../Utils/sessions" );

const router        = express.Router( );

const User = require( "./../classes/User" );

// —— Route index
router.get( "/", deserializeSession, ( req, res, next ) => {

    res.render( "index", {
        title: "Tuduuuuuuu",
    } );

});

// —— login index
router.get( "/login", ( req, res, next ) => {

    res.render( "login" );

});

router.post( "/login", ( req, res, next ) => {

   try {

        const { email, password } = req.body;

        if ( !( email && password ) )
            res.status( 418 ).send( "I'm a teapot" );

        if ( !email )
            res.status( 418  ).send( "Email required" );

        if ( !password )
            res.status( 418 ).send( "Password required" );

        console.log( email, password )

        const user = await new User( req.app.get( "BDD" ).getDB( ) );

        .ConnectUser( email, password );

    } catch ( error ) {
        console.error( error )
    }

});



module.exports = router;
