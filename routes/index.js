const express = require( "express" )
    , router  = express.Router();

// —— Route index
router.get( "/", ( req, res, next ) => {
    res.render( "index", {
        title: "Tuduuuuuuu",
    } );
});

module.exports = router;
