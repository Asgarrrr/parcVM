// ██████ Dependencies ████████████████████████████████████████████████████████

const express = require( "express"        );

const auth = require( "../middlewares/auth" );

const router = express.Router( );

const Temp = require( "../classes/temperature" );


// —— Save temperature on the database
router.post( "/temp", async ( req, res, next ) => {

    try {

        // —— Save temperature on the database
        new Temp( req.app.get( "BDD" ) ).insertTemp( req.query.deg );
        return res.status( 200 ).send( "OK" );

    } catch ( error ) {
        console.log( error );
        res.sendStatus( 500 );

    }

});

// —— Route index
router.get( "/getVMs", auth, async ( req, res, next ) => {

    try {

        res.json( await req.app.get( "PMX" ).getVMs( ) );

    } catch ( error ) {

        res.json( [ ] );

    }

});

module.exports = router;
