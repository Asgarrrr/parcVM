const express = require( "express" )
    , router  = express.Router();

// —— Route index
router.get( "/", ( req, res, next ) => {
    res.render( "users", { } );
});

module.exports = router;
