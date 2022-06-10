
const { Router } = require( "express" );
const router = Router( );
const auth   = require( "../middlewares/auth" );

const User = require( "../classes/user" );

// —— Route index
router.get( "/", auth, ( req, res, next ) => {

    if ( req.session.user.admin ) {
        res.render( "./admin/index", {
            user: req.session.user
        });
    } else {
        res.render( "./user/index", {
            user: req.session.user
        });
    }

});

router.get( "/vm", auth, ( req, res, next ) => {

    if ( req.session.user.admin ) {
        res.render( "./admin/vm", {
            user: req.session.user
        });
    } else {
        res.render( "./user/vm", {
            user: req.session.user
        });
    }

} );

router.get( "/dashboard", auth, ( req, res, next ) => {

    if ( req.session.user.admin ) {
        res.render( "./admin/dashboard", {
            user: req.session.user
        });
    } else {
        res.render( "./user/dashboard", {
            user: req.session.user
        });
    }

} );

router.get( "/project", auth, ( req, res, next ) => {

    if ( req.session.user.admin ) {
        res.render( "./admin/project", {
            user: req.session.user
        });
    } else {
        res.render( "./user/project", {
            user: req.session.user
        });
    }

} );

router.get( "/classes", auth, ( req, res, next ) => {

    if ( req.session.user.admin ) {
        res.render( "./admin/classes", {
            user: req.session.user
        });
    } else {
        res.render( "./user/classes", {
            user: req.session.user
        });
    }

} );

router.get( "/user" , auth, ( req, res, next ) => {

    if ( req.session.user.admin ) {
        res.render( "./admin/user", {
            user: req.session.user
        });
    } else {
        res.render( "random" );
    }

} );

router.get( "/tasks" , auth, ( req, res, next ) => {

    if ( req.session.user.admin ) {
        res.render( "./admin/tasks", {
            user    : req.session.user,
        });
    } else {
        res.sendStatus( 403 );
    }

} );

// —— login index
router.get( "/login", async ( req, res, next ) => {

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

        const user = await new User( req.app.get( "BDD" ) );
        const resp = await user.ConnectUser( email, password );

        if ( !resp || !resp.length )
            return res.status( 418 ).send( "No users found with this login/password combination" );


        console.log( resp[ 0 ].IdUser )

        user.CreateSession( resp[ 0 ].IdUser, req.sessionID );
        req.session.user = resp[ 0 ];

        res.redirect( "/")

    } catch ( error ) {
        console.error( error )
    }

});

router.get( "/logout", auth, async ( req, res, next ) => {

    try {

        const user = await new User( req.app.get( "BDD" ) );
        await user.DeleteSession( req.session.user.sessionID );
        req.session.destroy( );
        res.redirect( "./login" );

    } catch ( error ) {

        res.status( 418 ).send( error );
        console.error( error );

    }

});

router.get( "/mdt", auth, async ( req, res, next ) => {

    try {

        res.render( "./admin/mdt", { } );

    } catch ( error ) {

    }

});



module.exports = router;
