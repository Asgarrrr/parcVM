// ██████ Dependencies ████████████████████████████████████████████████████████

const express       = require( "express"        );

const auth = require( "../middlewares/auth" );

const router = express.Router( );


// —— Route index
router.get( "/getVMs", auth, async ( req, res, next ) => {

    try {

        res.json( await req.app.get( "PMX" ).getVMs( ) );

    } catch ( error ) {

        res.json( [ ] );

    }

});

module.exports = router;
