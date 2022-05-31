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

        if ( !port )
            throw new Error( "No port provided, default value is 8006" );

        // —— Keep the websocket
        this.socket = socket;

        this.DB = DB;

        this.axios = axios.create({
            baseURL     : `https://${ host }:${ port }/api2/json/`,
            timeout     : 10000,
            httpsAgent  : new https.Agent({ rejectUnauthorized: false }),
            headers     : {
                "Authorization": `PVEAPIToken ${ apiToken }`,
            },
        });


        this.axios.interceptors.response.use(
            ( response  ) => response,
            ( error     ) => ({
                data: {
                    error: error.message,
                },
            })
        );

        this.axios.get( ).catch( ( error ) => {
            throw new error( `Unable to connect to ${ this.host }:${ this.port }, ${ error.message }` );
        } );

        this.queue = {
            inProgress: [ ],
            waiting   : [ ],
        }

        this.getVMs( );
        this.getNextVMID( );

        // —— Set up the queue
        setInterval( ( ) => {

            this.getClusterEvents( ).then( ( data = [] ) => {

                data.filter( ( task ) => !task.endtime ).forEach( ( task ) => {

                    if ( this.queue.inProgress.find( ( operation ) => operation.upid === task.upid ) )
                        return;

                    this.queue.inProgress.push( task );

                });

                for ( const task of this.queue.inProgress ) {

                    const taskDetails = data.find( ( t ) => t.upid === task.upid );

                    if ( taskDetails && taskDetails.endtime ) {

                        this.queue.inProgress.splice( this.queue.inProgress.indexOf( task ), 1 );
                        console.log( task, `is finished` );

                    }

                }

            } );

        for ( let taskInProgress of this.queue.inProgress ) {

            if ( taskInProgress.run ) {

                taskInProgress.run.call( this, taskInProgress.args ).then( ( data ) => {

                    if ( taskInProgress.run?.name === "createVM" ) {

                        new VMDB( this.DB ).inservm( taskInProgress.args.ID )
                        this.socket.emit( "createVM", taskInProgress.args.ID );

                    } else if ( taskInProgress.run?.name === "deleteVM" ) {

                        new VMDB( this.DB ).deletevm( taskInProgress.args.ID )
                        this.socket.emit( "deleteVM", taskInProgress.args.ID );

                    }

                    taskInProgress.upid = data

                    delete taskInProgress.run;
                    delete taskInProgress.args;

                }).catch( ( e ) => {

                    console.error( chalk.red( e.message ) );
                    this.queue.inProgress.splice( this.queue.inProgress.indexOf( taskInProgress), 1 );

                }).finally( ( ) => {

                });

            }

        }

            if ( this.queue.waiting.length && this.queue.inProgress.length < 5 ) {

                const slots = 5 - this.queue.inProgress.length;

                const tasks = this.queue.waiting.splice( 0, slots );
                this.getNextVMID( );
                this.queue.inProgress.push( ...tasks );

            }

        }, 1000 );

        setInterval( ( ) => console.log( this.queue ), 300 )

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
    async getVMs( VMID, allowTemplate = false ) {

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

                const { data: { data: { result } } } = await this.axios.get( `nodes/${ VM.node }/qemu/${ VM.vmid }/agent/network-get-interfaces` );
                VM.network = result;

            } catch ( e ) {

                VM.network = null;

            }

        } ) );

        // —— Not really needed, but it's nice to order properties alphabetically
        return resources.flat().map( ( VMs ) => Object.keys( VMs ).sort( ).reduce( ( res, key ) => ( res[ key ] = VMs[ key ], res ), { } ) );

    }

    /**
     * @brief   Start a specific VM
     * @param  { Number } ID    ID of the VM to start
     * @return { String }       Processed ID
     * @throws { Error }        If the request failed
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
     * @brief   Stop a specific VM
     * @param  { Number } ID    ID of the VM to stop
     * @return { String }       Processed ID
     * @throws { Error }        If the request failed
     */
    async stopVM( { ID } ) {

        // —— Get the VM details
        const VM = await this.getVMs( ID );

        // —— Check if the VM is already stopped
        if ( !VM.length || VM[ 0 ].status === "stopped" )
            throw new Error( `VM ${ ID } is already stopped` );

        // —— Stop the VM
        const { data: { data: taskID } } = await this.axios.post( `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/status/shutdown` );

        if ( !taskID )
            throw new Error( `VM ${ ID } could not be stopped` );

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
            // full: true
        } );

        if ( !data )
            throw new Error( `Failed to clone VM ${ templateID }` );

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

            if ( this.queue.inProgress && this.queue.inProgress.length >= 5 )
                this.queue.waiting.push( { run: task, args } );
            else
                this.queue.inProgress.push( { run: task, args } );

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
    async useSnapshot( ID, snapshot = "init" ) {

        // —— Get the VM details
        const VM = this.getVMs( ID );

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

    async createSnapshot( ID, snapname ) {

        // —— Get the VM details
        const VM = await this.getVMs( ID );

        console.log( VM[ 0 ].vmid );

        // —— Check if the VM exists
        if ( !VM.length )
            throw new Error( `VM ${ ID } not found` );

        // —— Create the snapshot
        const { data: { data:taskID } } = await this.axios.post( `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/snapshot`, {
            snapname,
        } );

        if ( !taskID )
            throw new Error( `Failed to create snapshot ${ snapname } for VM ${ ID }` );

        return taskID;

    }

    async deleteSnapshot( ID, snapshot ) {

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

 }