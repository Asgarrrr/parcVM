
$( document ).ready( ( ) => {

    console.log(
        "%cSalut ! Systéme crée par Lucas Ghyselen & Jérémy Caruelle",
        "background-image: url( 'http://orig11.deviantart.net/dcab/f/2011/158/1/6/nyan_cat_by_valcreon-d3iapfh.gif' ); background-repeat: no-repeat; background-size: cover; padding: 0px 0px 200px 0px; background-position: center center;",
    );

    console.log( "https://github.com/Asgarrrr", "https://github.com/LucasGLaPro" );

    // Create a new websocket connection
    const socket = io( "192.168.64.103", {
        transports: [ "websocket" ],
    } );

    let selected = 0;



} );

    // // New DataTable
    // const table = $( "#table_id" ).DataTable( {
    //     pageLength: 100,
    //     columnDefs: [{

    //         "defaultContent": "-",
    //         "targets": "_all"
    //     }],
    //     columns: [
    //         { data: "" },
    //         { data: "ID" },
    //         { data: "Name" },
    //         { data: "Status" },
    //         { data: "IP" },
    //     ],
    //     "select": {
    //         style   : "multi",
    //         items   : "row",
    //         info    : false,
    //         selector: 'td:first-child'
    //     }
    // } );

    // $( "tbody" ).selectable({
    //     filter: ".vm-row",
    //     selected: ( e, ui ) => {

    //         $( ui.selected ).toggleClass( "table-primary", !onOff );
    //         $( ui.selected ).toggleClass( "selectedVM", !onOff );
    //         $( this ).find( ".selected" ).addClass( "ui-selecteed" );

    //         selected = table.rows( ".table-primary" ).count( );

    //         if ( selected <= 0 ) {

    //             for ( const button of document.getElementById( "actions" ).children )
    //                 button.disabled = true;

    //         } else {

    //             for ( const button of document.getElementById( "actions" ).children )
    //                 button.disabled = false;

    //         }

    //     }
    // }).mousedown( ( e ) => {

    //     onOff = $( e.target.parentNode ).hasClass( "table-primary" );

    // });

    // socket.on( "connect", ( ) => {

    //     console.log( " <> Connected to the server <> " );

    //     socket.emit( "update" );
    //     setInterval( ( ) => socket.emit( "update" ), 500 );

    // } );

    // socket.on( "update", ( data ) => {

    //     console.log( "%c < * > Data received < * >", "background-color: #00ff00; color: #000000;" );

    //     // console.log( "%c < * > Data received < * >", "background-color: #00ff00; color: #000000;" );

    //     // for ( const VM of data.VMS ) {

    //     //     console.log( "de" );

    //     //     if ( VM.template ) {

    //     //         const select = document.getElementById( "createVMNameTemplate" );

    //     //         // Get all options contents
    //     //         const options = [ ...select.options ].map( ( option ) => option.text );

    //     //         if ( !options.includes( VM.name ) )
    //     //             select.add( new Option( VM.name, VM.vmid ) );

    //     //         continue;

    //     //     }

    //     //     var indexes = table.rows( ).eq( 0 ).filter( function ( rowIdx ) {
    //     //         return table.cell( rowIdx, 1 ).data() === VM.vmid ? true : false;
    //     //     } );

    //     //     if ( !indexes.length ) {

    //     //         let IP = "Disconnected";

    //     //         if ( VM.network ) {

    //     //             if ( VM.network.result.find( ( obj ) => obj.name === "ens18" ) );

    //     //             const ens18 = VM.network.result.find( ( obj ) => obj.name === "ens18" );

    //     //             if ( !ens18[ "ip-addresses" ] || !ens18[ "ip-addresses" ].length )
    //     //                 return;

    //     //             if ( ens18[ "ip-addresses" ].find( ( obj ) => obj[ "ip-address-type" ] === "ipv4" ) )
    //     //                 IP = ens18[ "ip-addresses" ].find( ( obj ) => obj[ "ip-address-type" ] === "ipv4" )[ "ip-address"]

    //     //         }

    //     //         const row = table.row.add( {
    //     //             "ID" : VM.vmid,
    //     //             "Name" : VM.name,
    //     //             "Status" : VM.lock ? `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>` : `<span class="badge bdg-${ VM.status }">${ VM.status.charAt( 0 ).toUpperCase() + VM.status.substring( 1 ) } </span>`,
    //     //             "IP" : IP

    //     //         } ).draw( );

    //     //         row.node().classList.add( "vm-row" );

    //     //     } else {

    //     //         if ( table.cell( indexes[ 0 ], 2 ).data() !== VM.name )
    //     //             table.cell( indexes[ 0 ], 2 ).data( VM.name );

    //     //         if ( table.cell( indexes[ 0 ], 3 ).data() !== VM.status )
    //     //             if ( !( [ ...table.cell( indexes[ 0 ], 3 ).node( ).children[ 0 ].classList ].includes( "spinner-border" ) && VM.lock ) )
    //     //                 table.cell( indexes[ 0 ], 3 ).data( `<span class="badge bdg-${ VM.status }">${ VM.status.charAt( 0 ).toUpperCase() + VM.status.substring( 1 ) } </span>` );

    //     //         let IP = "Disconnected";

    //     //         if ( VM.network ) {

    //     //             if ( VM.network.result.find( ( obj ) => obj.name === "ens18" ) );

    //     //             const ens18 = VM.network.result.find( ( obj ) => obj.name === "ens18" );

    //     //             if ( !ens18[ "ip-addresses" ] || !ens18[ "ip-addresses" ].length )
    //     //                 return;

    //     //             if ( ens18[ "ip-addresses" ].find( ( obj ) => obj[ "ip-address-type" ] === "ipv4" ) )
    //     //                 IP = ens18[ "ip-addresses" ].find( ( obj ) => obj[ "ip-address-type" ] === "ipv4" )[ "ip-address"]

    //     //             if ( table.cell( indexes[ 0 ], 4 ).data() !== IP )
    //     //                 table.cell( indexes[ 0 ], 4 ).data( IP );

    //     //         } else {

    //     //             if ( table.cell( indexes[ 0 ], 4 ).data() !== IP )
    //     //                 table.cell( indexes[ 0 ], 4 ).data( IP );

    //     //         }

    //     //     }

    //     // }

    //     // // Remove old table row already not in the new data
    //     // const indexesToRemove = table.rows( ).eq( 0 ).filter( function ( rowIdx ) {
    //     //     return !data.VMS.find( ( obj ) => obj.vmid === table.cell( rowIdx, 1 ).data() ) ? true : false;
    //     // });

    //     // if ( indexesToRemove.length )
    //     //     table.rows( indexesToRemove ).remove( ).draw( );

    //     // // Remove old template row already not in the new data
    //     // const select = document.getElementById( "createVMNameTemplate" );

    //     // // Get all options contents
    //     // const options = [ ...select.options ].map( ( option ) => option.text );

    //     // for ( const option of options )
    //     //     if ( option !== "Aucun" && !data.VMS.find( ( obj ) => obj.name === option ) )
    //     //         select.remove( select.selectedIndex );
    // } );

    // document.getElementById( "deleteButton" ).addEventListener( "click", ( ) => {

    //     const selecteds = document.querySelectorAll( ".selectedVM" );

    //     for ( const selected of selecteds )
    //         socket.emit( "deleteVMRequest", parseInt( selected.cells[ 1 ].innerHTML ) );

    // } );

    // document.getElementById( "startButton" ).addEventListener( "click", ( ) => {

    //     const selecteds = document.querySelectorAll( ".selectedVM" );

    //     for ( const selected of selecteds )
    //         socket.emit( "startVMRequest", parseInt( selected.cells[ 1 ].innerHTML ) );

    // } );

    // document.getElementById( "stopButton" ).addEventListener( "click", ( ) => {

    //     const selecteds = document.querySelectorAll( ".selectedVM" );

    //     for ( const selected of selecteds )
    //         socket.emit( "stopVMRequest", parseInt( selected.cells[ 1 ].innerHTML ) );

    // } );

    // document.getElementById( "createVMRequest" ).addEventListener( "click", ( ) => {

    //     const createVMQuantity      = document.getElementById( "createVMQuantity" );
    //     const createVMNameTemplate  = document.getElementById( "createVMNameTemplate" );
    //     const createVMName          = document.getElementById( "createVMName" );

    //     if ( !createVMQuantity.value ) {
    //         createVMQuantity.classList.add( "is-invalid" );
    //         return;
    //     }

    //     const newVMs = [ ];

    //     // Loop over the quantity
    //     for ( let i = 0; i < parseInt( createVMQuantity.value ); i++ ) {

    //         const specs = { };
    //         specs.name = createVMNameTemplate.value;

    //         // Check if name contains loop constants
    //         if ( createVMName.value.match( /\$X/gm ) ) {

    //             if ( createVMName.value.match( /\$X-\d+/gm ) ) {

    //                 specs.name = createVMName.value.replace( /\$X-\d+/gm, i + parseInt( createVMName.value.match( /\$X-\d+/gm )[ 0 ].replace( /\$X-/, "" ) ) );

    //             } else {

    //                 specs.name = createVMName.value.replace( /\$X/gm, i + 1 );

    //             }

    //             specs.template = createVMNameTemplate.value;
    //             newVMs.push( specs );

    //         }

    //     }

    //     socket.emit( "createVMRequest", newVMs );








//     });

// } );
