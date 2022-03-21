
// —— Query selectors


// Interfaces
const vmList            = document.getElementById( "VMContent" )
      stopVMs           = document.getElementById( "stopVMs" )
      startVMs          = document.getElementById( "startVMs" )
      deleteVMs         = document.getElementById( "deleteVMs" );
      checkAll          = document.getElementById( "checkAll" );

( async ( ) => {

    const socket = io( "http://localhost:3000", {} );

    socket.on( "connect", ( ) => {

        setInterval( ( ) => socket.emit( "getVMs" ) , 1000 );

   
        checkAll.addEventListener( "click", ( e ) => {
            vmList.querySelectorAll( "input[type=checkbox]" ).forEach( ( input ) => input.checked = e.target.checked ? true : false );
        } );

        stopVMs.addEventListener( "click", ( ) => socket.emit( "stop", getSelectedVMs( ) ) );
        startVMs.addEventListener( "click", ( ) => socket.emit( "start", getSelectedVMs( ) ) );
        
    } );

    socket.on( "VMs", ( VMs ) => {

        // Get all VMs
        const allVMs = [...document.getElementById( "VMContent" ).querySelectorAll( "tr" )].map( ( tr ) => tr.id );

        for ( let i = 0; i < VMs.length; i++ ) {

            const VM = VMs[i];

            if ( !allVMs.includes( `VM-${ VM.vmid }` ) ) {

                console.log( VM )

                const tr = document.createElement( "tr" );
                tr.id = `VM-${ VM.vmid }`;

                const td = document.createElement( "td" );

                const input = document.createElement( "input" );
                input.setAttribute( "type", "checkbox" );
                input.classList.add( "form-check-input" );

                td.appendChild( input );
                tr.appendChild( td );

                const tdID = document.createElement( "td" );
                tdID.innerHTML = VM.vmid
                tr.appendChild( tdID );

                const tdName = document.createElement( "td" );
                tdName.innerText = VM.name;
                tdName.id = `VM-${ VM.vmid }-name`;
                tr.appendChild( tdName );

                const tdState = document.createElement( "td" );
                tdState.innerText = VM.status;
                tdState.id = `VM-${ VM.vmid }-status`;
                tr.appendChild( tdState );

                const tdAction = document.createElement( "td" );
                tdAction.id = `VM-${ VM.vmid }-action`;
                tr.appendChild( tdAction );

                vmList.appendChild( tr );

                continue;


            }

            // Remove VMs from allVMs
            allVMs.splice( allVMs.indexOf( `VM-${ VM.vmid }` ), 1 );

            const status = document.getElementById( `VM-${ VM.vmid }-status` );

            if ( status.innerHTML !== VM.status )
                status.innerHTML = VM.status;

        }


        // Remove VMs from allVMs
        allVMs.forEach( ( id ) => {

            const tr = document.getElementById( id );

            tr.remove( );

        } );


    });



})( );

function getSelectedVMs( ) {

    return [...vmList.querySelectorAll( "input[type=checkbox]:checked" )].map( ( input ) => parseInt( input.parentNode.parentNode.id.substring( 3 ) ) );

}