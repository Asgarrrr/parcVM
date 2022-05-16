
require( "dotenv" ).config();

// —— Class
const Proxmox   = require( "./classes/pmx.js"     )
    , BDD       = require( "./classes/bdd.js"     )
    , VM        = require( "./classes/VM.js"      )
    , User      = require( "./classes/user.js"    )
    , Project   = require( "./classes/project.js" );

// —— Dependencies
const createError   = require( "http-errors"     )
    , cookieParser  = require( "cookie-parser"   )
    , session       = require( "express-session" )
    , express       = require( "express"         )
    , path          = require( "path"            )
    , http          = require( "http"            );

// —— Express routes
const indexRouter = require( "./routes/index" )
    , APIRouter   = require( "./routes/API"   );

( async ( ) => {

    console.log( " Abyss - Server wake up 🚀 " );

    const app    = express( )
        , server = http.createServer( app )
        , io     = require( "socket.io" )(server);

    const DB    = await ( new BDD( process.env.DBHOST, process.env.DBLOGIN, process.env.DBPASS, process.env.DBTABLENAME ) ).connect( );

    const ProjectManager = new Project( DB );
    const UserManager    = new User( DB );

    // —— Session
    const sessionMiddleware = session({
        secret              : process.env.SESSION_SECRET,
        name                : process.env.SESSION_NAME,
        resave              : true,
        saveUninitialized   : true,
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
    app.use( "/API", APIRouter );

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

    const PMX = new Proxmox( DB, process.env.PROXMOXTOKEN, process.env.PROXMOXHOST, process.env.PROXMOXPORT );


    app.set( "PMX", PMX );
    app.set( "BDD", DB  );

    let VMS     = await PMX.getVMs( );
    let queue   = await PMX.getQueueTasks( );
    setInterval( async ( ) => {
        VMS     = await PMX.getVMs( );
        queue   = await PMX.getQueueTasks( );
    }, 5000 );

    // setInterval( async ( ) => {

    //     console.log( VMS.filter( ( VM ) => VM.vmid === 118 ) );

    // }, 100 );



    io.on( "connection", ( socket ) => {

        const session = socket.request.session;

        socket.on( "update", async ( data ) => {

            socket.emit( "update", {
                VMS, queue
            } );

        } );

        socket.on( "createVMRequest", async ( data ) => {

            const session = socket.request.session;

            let baseID = await PMX.getNextVMID( );

            for ( const { name, template } of data ) {

                if ( template === "Aucun" )
                    PMX.pushTask( PMX.createVM, { ID: baseID++, name } );
                else
                    PMX.pushTask( PMX.cloneVM, { templateID: template, ID: baseID++, name } );

            }

        } );

        socket.on( "deleteVMRequest", async ( data ) => {

            PMX.pushTask( PMX.deleteVM, { ID: data } );

        } );

        socket.on( "startVMRequest", async ( data ) => {

            console.log( "Demande de démarrage de la VM " + data );
            PMX.pushTask( PMX.startVM, { ID: data } );

        } );

        socket.on( "stopVMRequest", async ( data ) => {

            console.log( "Demande d'arrêt de la VM " + data );
            PMX.pushTask( PMX.stopVM, { ID: data } );

        } );

        socket.on( "loadProjets", async ( data ) => {

            console.log( "Demande de chargement des projets" );

            socket.emit( "loadProjets", await ProjectManager.GetAllProject( ) );

        } );

        socket.on( "getProjectDetail", async ( data ) => {

            console.log( "Demande de détail du projet " + data );

            socket.emit( "getProjectDetail", {
                project : await ProjectManager.GetProject( data ),
                VM      : VMS.map( ( VM ) => ({ id: VM.vmid, name: VM.name })),
                users   : await UserManager.GetAllUser( )
            } );

        } );

        socket.on( "editProject", async ( data ) => {

            console.log( "Demande d'édition du projet " + data );

            await ProjectManager.EditProject( data );

        } );

        socket.on( "createProject", async ( data ) => {

            try {

                await ProjectManager.CreateProject( data );
                socket.emit( "createProject", data );

            } catch ( error ) {
                socket.emit( "createProject", "fail" );
            }

        } );

        socket.on( "deleteProject", async ( data ) => {

            try {

                await ProjectManager.DeleteProject( data );
                socket.emit( "deleteProject", data );

            } catch ( error ) {
                socket.emit( "deleteProject", "fail" );
            }

        } );


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