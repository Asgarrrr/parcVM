const express = require( "express" )
    , router  = express.Router();

// —— Route index
router.get( "/", ( req, res, next ) => {
    res.render( "index", {
        title: "Tuduuuuuuu",
    } );
});

router.get( "/test", async ( req, res, next ) => {

    const pmx = req.app.get( "pmx" );
    let VMS = await pmx.getVMs( );

    res.render( "test", { VMS } );

});

router.get( "/testuser", async ( req, res, next ) => {

    const pmx = req.app.get( "pmx" );
    let VMS = await pmx.getVMs( );

    res.render( "testuser", { VMS } );

});

module.exports = router;
