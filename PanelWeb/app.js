
require( "dotenv" ).config();

// —— Class
const Proxmox   = require( "./classes/pmx.js" )
    , BDD       = require( "./classes/bdd.js"  )
    , VM        = require( "./classes/VM.js"   )
    , User      = require( "./classes/user.js" );

// —— Dependencies
const createError   = require( "http-errors"     )
    , cookieParser  = require( "cookie-parser"   )
    , session       = require( "express-session" )
    , express       = require( "express"         )
    , path          = require( "path"            )
    , http          = require( "http"            );
// —— Express routes
const indexRouter = require( "./routes/index" );

( async ( ) => {

    console.log( " Abyss - Server wake up 🚀 " );

    const app    = express( )
        , server = http.createServer( app )
        , io     = require( "socket.io" )(server);

    // —— Session
    const sessionMiddleware = session({
        secret              : process.env.SESSION_SECRET,
        name                : process.env.SESSION_NAME,
        resave              : false,
        saveUninitialized   : false,
        cookie              : {
            maxAge : 3600000 * 24
        },
        secure              : true
    });

    app.use( sessionMiddleware );

    io.use( ( socket, next ) => sessionMiddleware( socket.request, {}, next ) );

    // —— View engine setup
    app.set( "views", path.join( __dirname, "views" ) );
    app.set( "view engine", "ejs" );

    app.use( express.json() );
    app.use( express.urlencoded({
        extended: false
    }) );

    app.use( cookieParser( ) );
    app.use( express.static( path.join( __dirname, "public" ) ) );

    // —— Get port from environment and store in Express.
    const port = normalizePort( process.env.PORT || "80" );
    app.set( "port", port );

    // —— Routes
    app.use( "/", indexRouter );

    // —— Catch 404 and forward to error handler
    app.use( ( req, res, next ) => next( createError( 404 ) ) );

    // —— Error handler
    app.use( ( err, req, res, next ) => {
        // —— Set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error   = req.app.get( "env" ) === "development" ? err : {};

        // —— Render the error page
        res.status( err.status || 500 );
        res.render( "error" );
    });

    server.listen( port );
    server.on( "error", onError );
    server.on( "listening", ( ) => {

        const addr = server.address()
            , bind = typeof addr === "string" ? `pipe ${ addr }` : `port ${ addr.port }`;

        console.log( `Listening on http://localhost:${ addr.port }` );

    } );

    app.set( "BDD", await new BDD( process.env.DBLOGIN, process.env.DBPASS, process.env.DBTABLENAME ) );

    io.on( "connection", ( socket ) => {

        socket.on( ""

        const session = socket.request.session;
        console.log( session )
    });

})( );


/**
 * Normalize a port into a number, string, or false.
 * @param   { string } port
 * @returns { number }
 */
function normalizePort( val ) {

    const port = parseInt( val, 10 );

    return isNaN( port ) ? val : port > 0 ? port : false;

}

/**
 * Event listener for HTTP server "error" event.
 * @param   { object } error
 * @returns { void }
 * @throws  { object }
 */
function onError( error ) {
    if ( error.syscall !== "listen" )
        throw error;

    const bind = typeof port === "string" ? `Pipe ${ port }` : `Port ${ port }`;

    // —— Handle specific listen errors with super friendly messages :)
    switch ( error.code ) {
        case "EACCES":
            console.error( `${ bind } requires elevated privileges` );
            process.exit( 1 );
        case "EADDRINUSE":
            console.error( `${ bind } is already in use` );
            process.exit( 1 );
        default:
            // —— In all other cases, throw the error, because I don't know what to do.
            throw error;
    }
}