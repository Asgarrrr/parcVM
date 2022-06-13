// ██████ Dependencies ████████████████████████████████████████████████████████

const express = require( "express"        );

const auth = require( "../middlewares/auth" );

const router = express.Router( );

const nodemailer = require( "nodemailer" )

const Temp = require( "../classes/temperature" );

// —— Save temperature on the database
router.post( "/temp", async ( req, res, next ) => {

    try {

        // —— Save temperature on the database
        if ( req.query.deg ) {

            new Temp( req.app.get( "BDD" ) ).insertTemp( req.query.deg );
            res.status( 200 );

            if ( parseFloat( req.query.deg ) > parseFloat( process.env.TEMP_MAX ) ) {

                const transporter = nodemailer.createTransport({
                    host: process.env.MAIL_HOST,
                    port: process.env.MAIL_PORT,
                    auth: {
                        user: process.env.MAIL_USER,
                        pass: process.env.MAIL_PASS
                    }
                });

                transporter.sendMail({
                    from    : "admin@abyss.com",
                    to      : process.env.MAIL_TO,
                    subject : "Dépassement de température",
                    text    : "La température est dépassée à " + req.query.deg + "°C, (" + ( parseFloat( req.query.deg ) - parseFloat( process.env.TEMP_MAX ) ) + "°C en trop )"
                }, ( error, info ) => {

                    if ( error )
                        return console.log( error );

                });


            }

        }

    } catch ( error ) {
        console.log( error );
        res.sendStatus( 500 );

    }

});

router.get( "/labo", async ( req, res, next ) => {

    console.log( req.query );

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    transporter.sendMail({
        from    : "alarme@laboSN1.com",
        to      : req.query.admin.split( ";" ),
        subject : "Intrusion détectée",
        text    : req.query.corps
    }, ( error, info ) => {

        if ( error )
            return console.log( error );

    });

});

module.exports = router;
