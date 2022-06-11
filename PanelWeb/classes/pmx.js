/**
 * @brief   Class for handling Proxmox VE API
 * @author  Caruelle Jérémy
 * @version 1.0
 * @date    2022-03-18
 */

 const axios    = require( "axios" );
 const https    = require( "https" );
 const chalk    = require( "chalk" );
 const VMDB     = require( "../classes/VM.js" );

 module.exports = class Proxmox {

    constructor( DB, socket, apiToken, host, port = 8006 ) {

        // —— Check if everything is ok

        if ( !DB )
            throw new Error( "No database provided" );

        if ( !apiToken )
            throw new Error( "No API token provided" );

        if ( !host )
            throw new Error( "No host provided" );

        this.port = port;

        // —— Keep the websocket
        this.socket = socket;

        this.DB = DB;

        this.hosts = { }
        // —— Parse host string, split space, key start from start to :, and host from : to end
        for ( const h of host.split( " " ) ) {
            const [ node, pmxhost ] = h.split( ":" );
            this.hosts[ node ] = pmxhost;
        }

        if ( !Object.entries( this.hosts ).length )
            throw new Error( "No host provided" );

        this.axios = axios.create({
            baseURL     : `https://${ Object.values( this.hosts )[ 0 ] }:${ port }/api2/json/`,
            timeout     : 0,
            httpsAgent  : new https.Agent({ rejectUnauthorized: false }),
            headers     : {
                "Authorization": `PVEAPIToken ${ apiToken }`,
            },
        });

        this.axios.interceptors.response.use(
            ( response  ) => response,
            ( error     ) => {
                return {
                    data: {
                        data: {
                            error: error.message,
                        },
                    },
                }
            });

        this.axios.get( ).catch( ( error ) => {
            throw new error( `Unable to connect to ${ this.host }:${ this.port }, ${ error.message }` );
        } );

        this.queue = {
            inProgress: [ ],
            waiting   : [ ],
        }

        this.cacheIP = { };

        // —— Set up the queue
        setInterval( ( ) => {

            this.getClusterEvents( ).then( ( data = [] ) => {

                data.filter( ( task ) => {

                    if ( task.type === "vncshell" )
                        return false;

                    if ( !task.endtime )
                        return true;

                }).forEach( ( task ) => {

                    if ( this.queue.inProgress.find( ( operation ) => operation.upid === task.upid ) )
                        return;

                    this.queue.inProgress.push( task );

                });

                for ( const task of this.queue.inProgress ) {

                    const taskDetails = data.find( ( t ) => t.upid === task.upid );

                    if ( taskDetails && taskDetails.endtime ) {

                        switch( taskDetails.type ) {

                            case "qmcreate":
                                try {
                                    new VMDB( this.DB ).inservm( taskDetails.id );
                                    this.socket.emit( "createVM", taskDetails.id );

                                    // —— Create initial snapshot
                                    this.pushTask( this.createSnapshot, {
                                        VMID        : taskDetails.id,
                                        snapname    : "Initial",
                                        description : "Snapshot initiale"
                                    } );
                                } catch ( error ) {
                                    console.log( error );
                                }
                            break;

                            case "qmdestroy":
                                try {
                                    new VMDB( this.DB ).deletevm( taskDetails.id )
                                    this.socket.emit( "deletedVM", taskDetails.id );
                                } catch ( error ) {
                                    console.error( error );
                                }

                            break;

                        }

                        this.queue.inProgress.splice( this.queue.inProgress.indexOf( task ), 1 );

                    }

                }

            } );

            for ( let taskInProgress of this.queue.inProgress ) {

                if ( taskInProgress.run ) {

                    taskInProgress.run.call( this, taskInProgress.args ).then( ( data ) => {

                        taskInProgress.upid = data

                        delete taskInProgress.args;

                    }).catch( ( e ) => {

                        console.error( "error", chalk.red( e.message ) );
                        this.queue.inProgress.splice( this.queue.inProgress.indexOf( taskInProgress ), 1 )

                    }).finally( ( ) => {
                        console.log( this.queue.inProgress.length );
                    });

                    delete taskInProgress.run;

                }

            }

            if ( this.queue.waiting.length && this.queue.inProgress.length < 1 ) {

                const slots = 1 - this.queue.inProgress.length;

                const tasks = this.queue.waiting.splice( 0, slots );
                this.getNextVMID( );
                this.queue.inProgress.push( ...tasks );

            }

        }, 1000 );

    }

    /**
     * @brief   Load last cluster events
     * @return  { Array } List of events
     */
    async getClusterEvents( ) {

        const { data: { data } } = await this.axios.get( "cluster/tasks" );
        return data;

    }

    /**
     * @brief   Get the list of all or specific nodes
     * @param   { Array } [ nodes ] List of nodes to get
     * @return  { Array }           List of nodes
     * @throws  { Error }           If the request failed
     */
    async getNodes( IDS ) {

        const { data: { data } } = await this.axios.get( "nodes" );

        if ( IDS )
            return data.filter( ( node ) => IDS.includes( node.node ) );

        return data;

    }

    /**
     * @brief   Get the list of all or specific VMs
     * @param   { Number } [ VMs ]             List of VMs to get
     * @param   { String } [ allowTemplate ]   Allow templates to be returned
     * @return  { Array  }                     List of VMs
     */
    async getVMs( VMID, allowTemplate = true ) {

        if ( typeof VMID === "string" )
            VMID = parseInt( VMID );

        let { data: { data: resources } } = await this.axios.get( "cluster/resources" );

        if ( !resources || !resources.length )
            return [ ];

        // —— Only keep VMs
        if ( resources.length )
            resources = resources.filter( ( VM ) => VM.type === "qemu" );

        // —— Remove templates if not allowed
        if ( !allowTemplate )
            resources = resources.filter( ( VM ) => !VM.template );

        // —— Filter by ID
        if ( VMID )
            resources = resources.filter( ( VM ) => VM.vmid === VMID );

        // —— Get network information ( IP, MAC, etc. )
        await Promise.all( resources.map( async ( VM ) => {

            try {

                if( this.hosts[ VM.node ] )
                    VM.nodeIP = `${ this.hosts[ VM.node ] }:${ this.port }`;

                if ( VM.status === "running" ) {

                    if ( !this.cacheIP[ VM.vmid ] || this.cacheIP[ VM.vmid ] && this.cacheIP[ VM.vmid ].timeout < Date.now() ) {

                        const { data: { data: { result } } } = await this.axios.get( `nodes/${ VM.node }/qemu/${ VM.vmid }/agent/network-get-interfaces` );

                        this.cacheIP[ VM.vmid ] = {
                            timeout: Date.now() + ( 1000 * 60 ),
                            IP     : result
                        }

                    } else {

                        VM.network = this.cacheIP[ VM.vmid ].IP;

                    }

                } else VM.network = null;


            } catch ( e ) {

                VM.network = null;

            }

        } ) );

        // —— Not really needed, but it's nice to order properties alphabetically
        return resources.flat().map( ( VMs ) => Object.keys( VMs ).sort( ).reduce( ( res, key ) => ( res[ key ] = VMs[ key ], res ), { } ) );

    }

    /**
     * @brief Start a specific VM
     * @param  { Number } ID    ID of the VM to start
     * @return { String }       Processed ID
     * @throws { Error  }       If the request failed
     */
    async startVM( { ID } ) {

        // —— Get the VM details
        const VM = await this.getVMs( ID );

        // —— Check if the VM is already running
        if ( !VM.length || VM[ 0 ].status === "running" )
            throw new Error( `VM ${ ID } is already started` );

        // —— Start the VM
        const { data: { data: taskID } } = await this.axios.post( `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/status/start` );

        if ( !taskID )
            throw new Error( `VM ${ ID } could not be started` );

        return taskID;

    }

    /**
     * @brief Stop a specific VM
     * @param  { Number } ID    ID of the VM to stop
     * @return { String }       Processed ID
     * @throws { Error  }       If the request failed
     */
    async stopVM( { ID } ) {

        // —— Get the VM details
        const VM = await this.getVMs( ID );

        // —— Check if the VM is already stopped
        if ( !VM.length || VM[ 0 ].status === "stopped" )
            throw new Error( `VM ${ ID } is already stopped` );

        // —— Stop the VM
        const { data: { data: taskID } } = await this.axios.post( `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/status/stop` );

        if ( !taskID )
            throw new Error( `VM ${ ID } could not be stopped` );

        return taskID;

    }


    /**
     * @brief Reboot a specific VM
     * @param  { Number } ID    ID of the VM to stop
     * @return { String }       Processed ID
     * @throws { Error  }       If the request failed
     */
    async rebootVM( { ID } ) {

        // —— Get the VM details
        const VM = await this.getVMs( ID );

        // —— Check if the VM is already stopped
        if ( !VM.length )
            throw new Error( `VM ${ ID } does not exist` );

        // —— Stop the VM
        const { data: { data: taskID } } = await this.axios.post( `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/status/reboot` );

        if ( !taskID )
            throw new Error( `VM ${ ID } could not be rebooted` );

        return taskID;

        }

    /**
     * @brief   Create a new VM
     * @param   { Number } ID       ID of the VM to create
     * @param   { String } name     Name of the VM to create
     * @param   { String } template Template to use
     * @return  { String }          Processed ID
     * @throws  { Error }           If the request failed
     */
    async createVM( { ID, name, template } ) {

        const nodes = await this.getNodes( );

        // Determine the most suitable node for the VM creation based on the available resources ( Memory, Disk, CPU )
        const node = nodes.sort( ( a, b ) => {

            const aCPU  = a.maxcpu - a.cpu;
            const bCPU  = b.maxcpu - b.cpu;

            const aMem  = a.maxmem - a.mem;
            const bMem  = b.maxmem - b.mem;

            const aDisk = a.disk.total - a.maxdisk;
            const bDisk = b.disk.total - b.maxdisk;

            return ( aCPU * aMem * aDisk ) - ( bCPU * bMem * bDisk );

        } )[ 0 ];

        const { data: { data } } = await this.axios.post( `nodes/${ node.node }/qemu`, {
            name,
            vmid: ID,
        } )

        if ( !data )
            throw new Error( `Failed to create VM ${ name }` );

        return data;

    }

    /**
     * @brief   Delete a specific VM
     * @param   { Number } ID       ID of the VM to create
     * @throws  { Error }           If the request failed
     * @return  { String }          Processed ID
     */
    async deleteVM( { ID } ) {

        if ( !ID )
            throw new Error( "No VM ID provided" );

        if ( typeof ID === "string" )
            ID = parseInt( ID );

        // —— Check if the VM exists
        const VM = await this.getVMs( ID );

        if ( !VM.length )
            throw new Error( `VM ${ ID } not found` );

        // —— Delete the VM
        const { data: { data: taskID } } = await this.axios.delete( `nodes/${ VM[ 0 ].node }/qemu/${ ID }?purge=0&destroy-unreferenced-disks=0` )

        if ( !taskID )
            throw new Error( `Failed to delete VM ${ ID }` );

        return taskID;

    }

    async cloneVM( { templateID, ID, name } ) {

        if ( !templateID )
            throw new Error( `No template ID provided` );

        if ( !ID )
            throw new Error( `No VM ID provided` );

        if ( typeof ID === "string" )
            ID = parseInt( ID );

        if ( typeof templateID === "string" )
            templateID = parseInt( templateID );

        const VM = await this.getVMs( templateID );
        if ( !VM.length )
            throw new Error( `VM ${ templateID } not found` );

        const { data: { data } } = await this.axios.post( `nodes/${ VM[ 0 ].node }/qemu/${ templateID }/clone`, {
            name,
            newid: ID,
            full: false
        } );

        if ( !data )
            throw new Error( `Failed to clone VM ${ templateID }` );

        return data;

    }

    /**
     * @brief   Get RRD statistics
     * @param   { Number } ID       ID of the VM to check
     * @return  { Object }          RRD statistics
     * @throws  { Error }           If the request failed
     */
    async rrddata( { ID } ) {

        if ( !ID )
            throw new Error( `No VM ID provided` );

        if ( typeof ID === "string" )
            ID = parseInt( ID );

        const VM = await this.getVMs( ID );

        if ( !VM.length )
            throw new Error( `VM ${ ID } not found` );

        const { data: { data } } = await this.axios.get( `nodes/${ VM[ 0 ].node }/qemu/${ ID }/rrddata?timeframe=hour&cf=AVERAGE` );

        if ( !data )
            throw new Error( `Failed to get RRD data for VM ${ ID }` );

        return data;

    }

     async getNextVMID( ) {

        try {
            const { data: { data } } = await this.axios.get( `cluster/nextid` );
            return data;
        } catch ( error ) {
            console.error( error );
        }

     }


    pushTask( task, args, index ) {

        try {

            const encapsulatedTask = { run: task, args, tasktype: task.name };

            switch( task.name ) {
                case "createVM":
                    encapsulatedTask.taskName = "createVM";
                    break;
                case "deleteVM":
                    encapsulatedTask.taskName = "deleteVM";
                    break;
            }

            if ( this.queue.inProgress && this.queue.inProgress.length >= 1 )
                this.queue.waiting.push( encapsulatedTask );
            else
                this.queue.inProgress.push( encapsulatedTask );

        } catch ( error ) {

            console.error( error );

        }

     }

    getQueueTasks( ) {

        return [
            this.queue.inProgress,
            this.queue.waiting,
        ]

    }

    async getSnapshots( ID ) {

        const VM = await this.getVMs( ID );

        if ( !VM.length )
            throw new Error( `VM ${ ID } not found` );

        const { data: { data } } = await this.axios.get( `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/snapshot` );

        console.log( data );

        if ( !data )
            throw new Error( `Failed to get snapshots for VM ${ ID }` );

        return data;

    }

    /**
     * @brief   Rollback a specific VM to a snapshot
     * @param   { Number } ID       ID of the VM to rollback
     * @param   { String } snapshot Snapshot to rollback to
     * @throws  { Error }           If the request failed
     * @return  { String }          Processed ID
     */
    async useSnapshot( { ID, snapshot = "Initial" } ) {

        // —— Get the VM details
        const VM = await this.getVMs( ID );

        // —— Check if the VM exists
        if ( !VM.length )
            throw new Error( `VM ${ ID } not found` );

        // —— Check if the snapshot exists
        const snapshots = await this.getSnapshots( ID );

        if ( !snapshots.length )
            throw new Error( `Snapshot ${ snapshot } not found` );

        // —— Check if the snapshot exists
        if ( !snapshots.find( ( s ) => s.name === snapshot ) )
            throw new Error( `Snapshot ${ snapshot } not found` );

        // —— Use the snapshot
        const { data: { data:taskID } } = await this.axios.post( `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/snapshot/${ snapshot }/rollback` );

        if ( !taskID )
            throw new Error( `Failed to use snapshot ${ snapshot } for VM ${ ID }` );

        return taskID;

    }

    async createSnapshot( { VMID, snapname, description } ) {

        // —— Get the VM details
        const VM = await this.getVMs( VMID );

        // —— Check if the VM exists
        if ( !VM.length )
            throw new Error( `VM ${ VMID } not found` );

        // —— Create the snapshot
        const { data: { data:taskID } } = await this.axios.post( `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/snapshot`, {
            snapname,
            description,
        } );

        if ( !taskID )
            throw new Error( `Failed to create snapshot ${ snapname } for VM ${ VMID }` );

        return taskID;

    }

    async deleteSnapshot( { ID, snapshot } ) {

        // —— Get the VM details
        const VM = await this.getVMs( ID );

        // —— Check if the VM exists
        if ( !VM.length )
            throw new Error( `VM ${ ID } not found` );

        // —— Check if the snapshot exists
        const snapshots = await this.getSnapshots( ID );

        if ( !snapshots.length )
            throw new Error( `Snapshot ${ snapshot } not found` );

        // —— Check if the snapshot exists
        if ( !snapshots.find( ( s ) => s.name === snapshot ) )
            throw new Error( `Snapshot ${ snapshot } not found` );

        // —— Delete the snapshot
        const { data: { data:taskID } } = await this.axios.delete( `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/snapshot/${ snapshot }` );

        if ( !taskID )
            throw new Error( `Failed to delete snapshot ${ snapshot } for VM ${ ID }` );

        return taskID;

    }

    async vncproxy( VMID ) {

        // —— Get the VM details
        const VM = await this.getVMs( VMID );

        // —— Check if the VM exists
        if ( !VM.length )
            throw new Error( `VM ${ VMID } not found` );

        // —— Get the VNC port
        const { data: { data } } = await this.axios.post( `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/vncproxy`, {
            "generate-password": false,
        } );

        if ( !data )
            throw new Error( `Failed to get VNC  ${ VMID }` );

            console.log( data )

        console.log(
            await this.axios({
                method: "get",
                url: `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/vncwebsocket`,
                headers: {
                    port: data.port,
                    vncticket: data.ticket
                },
            })
        );




        return data;



    };

    async loadResources( ) {

        const [
            { data: { data: resources } },
            { data: { data: status } },
        ] = await Promise.all( [
            this.axios.get( `cluster/resources` ),
            this.axios.get( `cluster/status` ),
        ])

        return {
            resources,
            status,
        };

    };

 }