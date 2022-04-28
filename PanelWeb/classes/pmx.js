/**
 * @brief   Class for handling Proxmox VE API
 * @author  Caruelle Jérémy
 * @version 1.0
 * @date    2022-03-18
 */

 const axios             = require( "axios" );
 const https             = require( "https" );
 const chalk             = require( "chalk" );

 module.exports = class Proxmox {

     constructor( apiToken, host, port = 8006 ) {

         // —— Check if everything is ok
         if ( !apiToken )
             throw new Error( "No API token provided" );

         if ( !host )
             throw new Error( "No host provided" );

         if ( !port )
             throw new Error( "No port provided, default value is 8006" );

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
             ( error     ) => ( { data: {  } } )
         );

         this.axios.get( ).catch( ( e ) => {
             throw new error(  `Unable to connect to ${ this.host }:${ this.port }, ${ error.message }` );
         } );

         this.queue = {
             inProgress: [ ],
             waiting   : [ ],
         }

         this.getVMs( );
         this.getNextVMID( );
         // this.deleteVM( );

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

                     }

                 }

             } );

            for ( let taskInProgress of this.queue.inProgress ) {

                if ( taskInProgress.run ) {

                    if ( taskInProgress.run.name == "createVM" )
                        this.lastVMID++

                    taskInProgress.run.call( this, taskInProgress.args ).then( ( data ) => {

                        console.log( chalk.green( `${ taskInProgress.upid } started` ) );

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

         setInterval( ( ) => {

            console.log( this.queue )

        }, 100 );

     }

     /**
      * @brief   Load last cluster events
      * @return  Promise
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
      * @param   { Array } [ VMs ] List of VMs to get
      * @return  { Array }         List of VMs
      * @throws  { Error }         If the request failed
      * @todo    Query parameters ( Search criteria )
      */
     async getVMs( ID ) {

         if ( ID && !Array.isArray( ID ) )
             ID = [ ID ];

         const nodes = await this.getNodes( );

         if ( !nodes && !nodes.length )
            return [ ];

         const VMs = await Promise.all( nodes.map( async ( node ) => {

            const { data: { data } } = await this.axios.get( `nodes/${ node.node }/qemu` );

            for ( let vm of data ) {

                const { data: { data: network } } = await this.axios.get( `nodes/${ node.node }/qemu/${ vm.vmid }/agent/network-get-interfaces` );

                vm.network = network;
                vm.node    = node.node;

            }

            return data;

         } ) );

         return VMs.flat().map ( ( VMs ) => Object.keys( VMs ).sort( ).reduce( ( res, key ) => ( res[ key ] = VMs[ key ], res ), { } ) );

     }

     async startVM( ID ) {

         const VM = await this.getVMs( ID );

         const { data: { data } } = await this.axios.post( `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/status/start` );

         return data;

     }

     async stopVM( ID ) {

         const VM = await this.getVMs( ID );

         if ( !VM.length || VM[ 0 ].status === "stopped" )
             throw new Error( `VM ${ ID } is already stopped` );

         const { data: { data } } = await this.axios.post( `nodes/${ VM[ 0 ].node }/qemu/${ VM[ 0 ].vmid }/status/stop` );

         return data;

     }

    async createVM( { ID, name } ) {

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

    async deleteVM( ) {

        const vms = await this.getVMs( );

        for ( const iterator of vms ) {
            if ( iterator.vmid !== 102 ) {
                this.stopVM( iterator.vmid ).catch( ( error ) => { } );
                await this.axios.delete( `nodes/${ iterator.node }/qemu/${ iterator.vmid }` );
            }
        }

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

 }