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

     constructor( DB, apiToken, host, port = 8006 ) {

        // —— Check if everything is ok

        if ( !DB )
            throw new Error( "No database provided" );

        if ( !apiToken )
            throw new Error( "No API token provided" );

        if ( !host )
            throw new Error( "No host provided" );

        if ( !port )
            throw new Error( "No port provided, default value is 8006" );

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
            ( error     ) => {
                chalk.red( error );
                return { data: {  } };
            }
        );

        this.axios.get( ).catch( ( e ) => {
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
                    console.log( `${ task } is finished` );

                    }

                }

            } );

        for ( let taskInProgress of this.queue.inProgress ) {

            if ( taskInProgress.run ) {

                taskInProgress.run.call( this, taskInProgress.args ).then( ( data ) => {

                    if ( taskInProgress.run.name === "createVM" )
                        new VMDB( this.DB ).inservm( taskInProgress.args.ID )
                    else if ( taskInProgress.run.name === "deleteVM" )
                        new VMDB( this.DB ).delvm( taskInProgress.args.ID )

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
      * @param   { Array  } [ VMs ]             List of VMs to get
      * @param   { String } [ allowTemplate ]   Allow templates to be returned
      * @return  { Array  }                     List of VMs
      * @todo    Query parameters ( Search criteria )
      */
     async getVMs( VMID = [ ], allowTemplate = false ) {

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
        if ( VMID.length )
            resources = resources.filter( ( VM ) => VMID.includes( VM.vmid ) );

        // —— Get network information ( IP, MAC, etc. )
        await Promise.all( resources.map( ( VM ) => {
            this.axios.get( `nodes/${ VM.node }/qemu/${ VM.vmid }/agent/network-get-interfaces` ).then( ( data ) => {
                VM.network = data?.data?.data?.network
            } );
        } ) );

        // —— Not really needed, but it's nice to order properties alphabetically
        return resources.flat().map( ( VMs ) => Object.keys( VMs ).sort( ).reduce( ( res, key ) => ( res[ key ] = VMs[ key ], res ), { } ) );

     }

     async startVM( ID ) {

        console.log( `Start VM ${ ID }` );
        const VM = await this.getVMs( ID );

        if ( !VM.length || VM[ 0 ].status === "running" )
            throw new Error( `VM ${ ID } is already started` );

        const { data: { data } } = await this.axios.post( `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/status/start` );

        if ( !data )
            throw new Error( `VM ${ ID } is already started` );

        return data;

     }

     async stopVM( ID ) {

        console.log( `Stopping VM ${ ID }` );
        const VM = await this.getVMs( ID );

        if ( !VM.length || VM[ 0 ].status === "stopped" )
            throw new Error( `VM ${ ID } is already stopped` );

        const { data: { data } } = await this.axios.post( `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/status/stop` );

        if ( !data )
        throw new Error( `VM ${ ID } could not be stopped` );

        return data;

     }

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

    async deleteVM( ID ) {

        if ( !ID )
            throw new Error( `No VM ID provided` );

        if ( typeof ID === "string" )
            ID = parseInt( ID );

        const VM = await this.getVMs( ID );

        if ( !VM.length )
            throw new Error( `VM ${ ID } not found` );

        const { data: { data } } = await this.axios.delete( `nodes/${ VM[ 0 ].node }/qemu/${ ID }?purge=0&destroy-unreferenced-disks=0` )

        if ( !data )
            throw new Error( `Failed to delete VM ${ ID }` );

        return data;

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

 }