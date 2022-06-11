
require( "dotenv" ).config();

// —— Class
const Proxmox       = require( "./classes/pmx.js"           )
    , BDD           = require( "./classes/bdd.js"           )
    , VM            = require( "./classes/VM.js"            )
    , User          = require( "./classes/user.js"          )
    , Project       = require( "./classes/project.js"       )
    , Class         = require( "./classes/class.js"         )
    , Temperature   = require( "./classes/temperature.js"   );

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

    const app    = express()
        , server = http.createServer( app )
        , io     = require( "socket.io" )( server, {
            cors: {
                origin: "*",
                credentials: true
            }
        } );

    const DB    = await ( new BDD( process.env.DBHOST, process.env.DBLOGIN, process.env.DBPASS, process.env.DBTABLENAME ) ).connect( );

    const ProjectManager     = new Project( DB );
    const UserManager        = new User( DB );
    const ClassManager       = new Class( DB );
    const TemperatureManager = new Temperature( DB );

    // —— Session
    const sessionMiddleware = session({
        secret              : process.env.SESSION_SECRET,
        name                : process.env.SESSION_NAME,
        resave              : true,
		saveUninitialized   : true
    });


    io.use( ( socket, next ) => sessionMiddleware( socket.request, socket.request.res || {}, next ) );

    app.use( sessionMiddleware );

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

    const PMX = new Proxmox( DB, io, process.env.PROXMOXTOKEN, process.env.PROXMOXHOST, process.env.PROXMOXPORT );


    app.set( "PMX", PMX );
    app.set( "BDD", DB  );

    let VMS     = await PMX.getVMs(  );
    let queue   = await PMX.getQueueTasks( );
    setInterval( async ( ) => {
        VMS     = await PMX.getVMs( );
        queue   = await PMX.getQueueTasks( );
    }, 1000 );

    io.on( "connection", ( socket ) => {

        socket.on( "loadVM", async ( data ) => {

            socket.emit( "loadVM", {
                VMS, queue
            } );

        } );

        socket.on( "createVMRequest", async ( data ) => {

            let baseID = await PMX.getNextVMID( );

            for ( const { name, template } of data ) {

                do baseID++
                while( VMS.find( ( vm ) => vm.vmid === baseID ) )

                if ( template === "Aucun" )
                    PMX.pushTask( PMX.createVM, { ID: baseID, name } );
                else
                    PMX.pushTask( PMX.cloneVM, { templateID: template, ID: baseID, name } );

            }

        } );

        socket.on( "startVMRequest", async ( data ) => {

            console.log( "Demande de démarrage de la VM " );
            PMX.pushTask( PMX.startVM, { ID: data } );

        } );

        socket.on( "rebootVMRequest", async ( data ) => {

            console.log( "Demande de redémarrage de la VM " );
            PMX.pushTask( PMX.rebootVM, { ID: data } );

        } );

        socket.on( "stopVMRequest", async ( data ) => {

            console.log( "Demande d'arrêt de la VM " );
            PMX.pushTask( PMX.stopVM, { ID: data } );

        } );

        socket.on( "deleteVMRequest", async ( data ) => {

            console.log( "Demande de suppression de la VM " + data );
            PMX.pushTask( PMX.deleteVM, { ID: data } );

        } );

        socket.on( "resetVMRequest", async ( data ) => {

            console.log( "Demande de réinitialisation de la VM " + data );
            PMX.pushTask( PMX.useSnapshot, { ID: data } );

        });

        socket.on( "loadProjets", async ( data ) => {

            console.log( socket.request.session );

            socket.emit( "loadProjets", await ProjectManager.GetAllProject( ) );

        } );

        socket.on( "getProjectDetail", async ( data ) => {

            socket.emit( "getProjectDetail", {
                project : await ProjectManager.GetProject( data ),
                VM      : VMS.map( ( VM ) => ({ id: VM.vmid, name: VM.name })),
                users   : await UserManager.GetAllUser( ),
            } );

        } );

        socket.on( "editProject", async ( data ) => {

            try {

                // —— Update project in database
                await ProjectManager.EditProject( data );
                socket.emit( "editProject", data );

            } catch ( error ) {
                socket.emit( "editProject", "fail" );
            }

        } );

        socket.on( "createProject", async ( data ) => {

            try {

                // —— Create project in database
                const id = await ProjectManager.CreateProject( data );
                socket.emit( "createProject", { ...data, id } );

            } catch ( error ) {
                socket.emit( "createProject", "fail" );
            }

        } );

        socket.on( "deleteProject", async ( data ) => {

            try {

                // —— Delete project in database
                await ProjectManager.DeleteProject( data );
                socket.emit( "deleteProject", data );

            } catch ( error ) {
                socket.emit( "deleteProject", "fail" );
            }

        } );

        socket.on( "loadUsers", async ( data ) => {

            socket.emit( "loadedUsers", await UserManager.GetAllUserDetails( ) );

        } );

        socket.on( "deletedVM", async ( data ) => {

            console.log( "VM deleted", data );

        } );

        socket.on( "loadVMDetail", async ( vmid ) => {

           try {

                socket.emit( "loadVMDetail", {
                    snapshot: await PMX.getSnapshots( vmid ),
                    VM      : VMS.find( ( VM ) => VM.vmid == vmid ),
                    RRData  : await PMX.rrddata({ ID: vmid }),
                } );

           } catch ( error ) {
                console.log( error );
                socket.emit( "loadVMDetail", {
                    snapshot: [ "error" ],
                } );
           }

        } );

        socket.on( "useVMSnapshot", async ( { VMID, snapshot } ) => {

            try {
                PMX.pushTask( PMX.useSnapshot, { ID: VMID, snapshot } );
                console.log( "Snapshot used", VMID, snapshot );
            } catch ( error ) {
                console.log( error );
            }

        });

        socket.on( "deleteVMSnapshot", async ( { VMID, snapshot } ) => {

            try {
                PMX.pushTask( PMX.deleteSnapshot, { ID: VMID, snapshot } );
                console.log( "Snapshot used", VMID, snapshot );
            } catch ( error ) {
                console.log( error );
            }

        });

        socket.on( "createVMSnapshot", async ( { VMID, snapname, description } ) => {

            try {
                PMX.pushTask( PMX.createSnapshot, { VMID, snapname, description } );
            } catch ( error ) {
                console.log( error );
            }

        });

        socket.on( "projetStartAllVM", async ( projectID ) => {

            const project = await ProjectManager.GetProject( projectID );

            if ( !project || !project.vms ) {
                socket.emit( "projetStartAllVM", "fail" );
                return;
            }

            // Remove all duplicates from VM list and start all VM
            for ( const VM of [ ...new Set( project.vms ) ] )
                PMX.pushTask( PMX.startVM, { ID: VM } );

        });

        socket.on( "projetStopAllVM", async ( projectID ) => {

            const project = await ProjectManager.GetProject( projectID );

            if ( !project || !project.vms ) {
                socket.emit( "projetStopAllVM", "fail" );
                return;
            }

            // Remove all duplicates from VM list and start all VM
            for ( const VM of [ ...new Set( project.vms ) ] )
                PMX.pushTask( PMX.stopVM, { ID: VM } );

        });

        socket.on( "loadUserDetails", async ( userID ) => {

            socket.emit( "loadUserDetails", {
                user    : userID === "newUser" ? "newUser" : await UserManager.GetUserbyId( userID ),
                VMS     : VMS.map( ( VM ) => ({ id: VM.vmid, name: VM.name })),
                projects: await ProjectManager.GetAllProject( ),
                classes: await ClassManager.GetAllClass( )
            } );

        });

        socket.on( "createUser", async( { name, firstName, mail, VM, Project, Class } ) => {

            try {

                const row = await UserManager.CreateUser(
                    name,
                    firstName,
                    mail,
                    Math.random( ).toString( 36 ).slice( -8 ),
                    0,
                    Project,
                    Class,
                    VM
                );

                socket.emit( "createUser", { idUser: row.insertId, name, firstName, mail, VM, Project, Class } );

            } catch ( error ) {

                console.log( error );

            }


        });

        socket.on( "updateUser", async( { ID, name, firstName, mail, VM, Project, Class } ) => {

            try {

                await UserManager.EditUser( ID, name, firstName, mail, null, Project, Class, VM );

                socket.emit( "updateUser", { ID, name, firstName, mail, VM, Project, Class } );

            } catch ( error ) {

                console.log( error );

            }

        });

        socket.on( "deleteUser", async( { ID } ) => {

            try {

                await UserManager.DeleteUser( ID );
                socket.emit( "deleteUser", { s: true, ID } );

            } catch ( error ) {

                console.log( error );

            }

        });

        socket.on( "loadClass", async ( ) => {

            try {

                const allUsers = await UserManager.GetAllUser( )
                    , allClass = await ClassManager.GetAllClass( );

                for( [ index, classs ] of Object.entries( allClass ) ) {

                    for ( const user of classs.users )
                        user.VM = Object.values( await UserManager.GetUserbyId( user.id ) )[ 0 ].VM

                }

                socket.emit( "loadClass", {
                    classes : allClass,
                    users   : allUsers
                } );

            } catch ( error ) {

                console.log( error );
                socket.emit( "loadClass", "fail" );

            }

        });

        socket.on( "startvncproxy", async ( { VMID } ) => {

            console.log( "Start VNC proxy", VMID );
            await PMX.vncproxy( VMID );

        });

        socket.on( "loadtasks", ( ) => {

            socket.emit( "loadtasks", PMX.getQueueTasks( ) );

        });

        socket.on( "loadRessources", async ( ) => {

            try {

                socket.emit( "loadRessources", {
                    ...await PMX.loadResources( ),
                    temp: {
                        current: await TemperatureManager.getLastTemp( ),
                        max    : process.env.TEMP_MAX,
                    },
                    queue: PMX.getQueueTasks( )
                } );

            } catch ( error ) {

                console.log( error );
                socket.emit( "loadRessources", "fail" );


            }

        });

        socket.on( "loadTemperatures", async ( ) => {

            try {

                socket.emit( "loadTemperatures", await TemperatureManager.getTemp( ) );

            } catch ( error ) {

                console.log( error );
                socket.emit( "loadTemperatures", "fail" );

            }


        });

        socket.on( "createClass", async ( { name, description, members } ) => {

            try {

                const membersParsed = ( await UserManager.GetAllUser( ) ).filter( ( user ) => members.includes( user.IdUser ) );

                for ( const member of membersParsed )
                    member.VM = Object.values( await UserManager.GetUserbyId( member.IdUser ) )[ 0 ].VM;

                const ID = await ClassManager.CreateClass( name, description, members );
                socket.emit( "createClass", { ID, name, description, membersParsed } );

            } catch ( error ) {

                console.error( error );
                socket.emit( "createClass", "fail" );

            }

        });

        socket.on( "deleteClass", async( IDClass ) => {

            try {

                await ClassManager.DeleteClass( IDClass );
                socket.emit( "deleteClass", "success" );

            } catch ( error ) {

                console.error( error );
                socket.emit( "deleteClass", "fail" );

            }

        });

        socket.on( "startAllVMClass", async ( classID ) => {

            const classMembers = await ClassManager.getClassMembers( classID )
                , classVMs     = [ ];

            for ( const member of classMembers )
                classVMs.push( Object.values( await UserManager.GetUserbyId( member.IdUser ) )[ 0 ].VM );

            for ( const VM of [ ...new Set( classVMs.flat( 5 ) ) ] )
                PMX.pushTask( PMX.startVM, { ID: VM } );


        });

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

    console.log( "Error: " + error );

}