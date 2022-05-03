
class PMW {
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
     * @param   { Array } [ VMs ]  List of VMs to get
     * @return  { Array }          List of VMs
     * @throws  { Error }          If the request failed
     * @todo    Add a filter to get only VMs with a specific status
     */
    async getVMs( IDs ) {

        const nodes = await this.getNodes( );

        const VMs = await Promise.all( nodes.map( async ( node ) => {

            const { data: { data } } = await this.axios.get( `nodes/${ node.node }/qemu` );

            data.forEach( ( VM ) => VM.node = node.node );

            if ( IDs )
                return data.filter( ( VM ) => IDs.includes( VM.vmid ) );

            return data;

        } ) );

        return VMs.flat( ).sort( ( a, b ) => a.vmid - b.vmid );

    }

    /**
     * @brief   Create multiple VMs
     * @param   { Array } [ VMs ]  List of VMs to create
     * @return  { Array }          List of tasks ID
     * @throws  { Error }          If the request failed
     */
    async createVMs( VMs ) {

        const lastVMs = await this.getVMs( );
        const lastVMID = lastVMs.reduce( ( max, VM ) => Math.max( max, VM.vmid ), 0 ) || 99;

        const promises = VMs.map( ( VM, i ) => this.axios.post( `nodes/pve1/qemu`, {
            vmid      : lastVMID + i + 1,
            name      : VM.name || "Untitled",
        } ) );

        const tasks = await Promise.all( promises );

        console.log( tasks );

        // return tasks.map( ( task ) => task.data.data );

    }

    /**
     * @brief   Delete multiple VMs
     * @param   { Array } [ VMs ]  List of VMs to delete
     * @return  { Array }          List of tasks ID
     * @throws  { Error }          If the request failed
     */
    async deleteVMs( IDs ) {

        let i = 0;

        const VMs = ( await this.getVMs( IDs ) ).filter( ( VM ) => IDs.includes( VM.vmid ) );

        const tasks = await Promise.all( VMs.map( async ( VM ) => {

            const { data: { data } } = await this.axios.delete( `nodes/${ VM.node }/qemu/${ VM.vmid }` );
            return data;

        } ) ).catch( ( e ) => { console.log( i++ ) } );

        return tasks;

    }

    /**
     * @brief   Start a VM
     * @param   { Array } [ VMs ]  List of VMs to start
     * @return  { Array }          List of tasks ID
     * @throws  { Error }          If the request failed
     */
    async startVMs( IDs ) {

        const VMs = await this.getVMs( IDs );

        const promises = VMs.map( ( VM ) => this.axios.post( `nodes/${ VM.node }/qemu/${ VM.vmid }/status/start` ) );

        const tasks = await Promise.all( promises );

        return tasks.map( ( task ) => task.data.data );

    }

    /**
     * @brief   Stop a VM
     * @param   { Array } [ VMs ]  List of VMs to stop
     * @return  { Array }          List of tasks ID
     * @throws  { Error }          If the request failed
     */
    async stopVMs( IDs ) {

        const VMs = await this.getVMs( IDs );

        const promises = VMs.map( ( VM ) => this.axios.post( `nodes/${ VM.node }/qemu/${ VM.vmid }/status/stop` ) );

        const tasks = await Promise.all( promises );

        return tasks.map( ( task ) => task.data.data );

    }

    /**
     * @brief   Reboot a VM
     * @param   { Array } [ VMs ]  List of VMs to reboot
     * @return  { Array }          List of tasks ID
     * @throws  { Error }          If the request failed
     */
    async rebootVMs( IDs ) {

        const VMs = await this.getVMs( IDs );

        const promises = VMs.map( ( VM ) => this.axios.post( `nodes/${ VM.node }/qemu/${ VM.vmid }/status/reboot` ) );

        const tasks = await Promise.all( promises );

        return tasks.map( ( task ) => task.data.data );

    }

    /**
     * @brief   Get the list of all snapshots of a VM
     * @param   { Array } [ VMs ]  List of VMs to get snapshots
     * @return  { Array }          List of snapshots
     * @throws  { Error }          If the request failed
     */
    async getSnapshots( IDs ) {

        const VMs = await this.getVMs( IDs );

        const promises = VMs.map( ( VM ) => this.axios.get( `nodes/${ VM.node }/qemu/${ VM.vmid }/snapshot` ) );

        const snapshots = await Promise.all( promises );

        return snapshots.map( ( snapshot ) => snapshot.data.data );

    }

    /**
     * @brief   Create a snapshot of a VM
     * @param   { Array } [ VMs ]  List of VMs to create a snapshot
     * @return  { Array }          List of tasks ID
     * @throws  { Error }          If the request failed
     */
    async createSnapshots( IDs, Snapname = "snapshot", Description = "Snapshot created by PMX" ) {

        const VMs = await this.getVMs( IDs );

        const promises = VMs.map( ( VM, i ) => this.axios.post( `nodes/${ VM.node }/qemu/${ VM.vmid }/snapshot`, {
            node        : VM.node,
            vmid        : VM.vmid,
            snapname    : Array.isArray( Snapname ) ? Snapname[ i ] : Snapname,
            description : Array.isArray( Sescription ) ? Sescription[ i ] : Sescription,
        } ) );

        const tasks = await Promise.all( promises );

        return tasks.map( ( task ) => task.data.data );

    }

    /**
     * @brief   Get all the tasks
     * @return  { Array }          List of tasks
     * @throws  { Error }          If the request failed
     */
    async getTasks( ) {

        const { data: { data } } = await this.axios.get( "cluster/tasks" );

        return data;

    }

    /**
     * @brief   Unlock all VMs locked by PMX
     * @return  { Array }          List of tasks ID
     * @throws  { Error }          If the request failed
     * @todo    { Refactor }       Use a better way to unlock VMs
     */

    async unlock( ) {

        console.log( "test" );

        const { data } = await this.axios.post( `nodes/pve1/vncshell`, {
            "node"      : "pve1",
            "cmd"       : "unlock 118",
            "cmd-opts"  : "118"
        } );

        console.log( data );




        // const VMs = await this.getVMs( );

        // if ( !VMs.length ) { return; }

        // const lockedVMs = VMS.filter( ( VM ) => VM.hasOwnProperty( "lock" ) );

        // const [ tasks ] = await Promise.all( lockedVMs.map( VM => {

        //         const { data: { data } } = await this.axios.post( `nodes/${ VM.node }/qemu/${ VM.vmid }/unlock` );

        //         return data;

        // })

        // );



    }

}