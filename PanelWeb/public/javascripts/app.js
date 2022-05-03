
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

    // New DataTable
    const table = $( "#table_id" ).DataTable( {
        pageLength: 100,
        columnDefs: [{

            "defaultContent": "-",
            "targets": "_all"
        }],
        columns: [
            { data: "" },
            { data: "ID" },
            { data: "Name" },
            { data: "Status" },
            { data: "IP" },
            { data: "Start date" },
            { data: "Salary" },
        ],
        "select": {
            style   : "multi",
            items   : "row",
            info    : false,
            selector: 'td:first-child'
        }
    } );

    $( "tbody" ).selectable({
        filter: ".vm-row",
        selected: ( e, ui ) => {

            $( ui.selected ).toggleClass( "table-primary", !onOff );
            $( this ).find( ".selected" ).addClass( "ui-selected" );

            selected = table.rows( ".table-primary" ).count( );

            if ( selected <= 0 )
                $( "#delete" ).prop( "disabled", true );
            else
                $( "#delete" ).prop( "disabled", false );



        }
    }).mousedown( ( e ) => {

        onOff = $( e.target.parentNode ).hasClass( "table-primary" );

    });

    socket.on( "connect", ( ) => {

        console.log( " <> Connected to the server <> " );

        socket.emit( "update" );
        setInterval( ( ) => socket.emit( "update" ), 5000 );

    } );

    socket.on( "update", ( data ) => {

        console.log( " <> Data received <> " );

        for ( const VM of data ) {

            // Find indexes of rows which have `Yes` in the second column
            var indexes = table.rows( ).eq( 0 ).filter( function ( rowIdx ) {
                return table.cell( rowIdx, 1 ).data() === VM.vmid ? true : false;
            } );


            if ( !indexes.length ) {

                let IP = "?";

                if ( VM.network ) {
                    // Find on array the object with name
                    const ipnet = VM.network.result.filter( ( obj ) => obj.name === "ens18" );
                    IP = ipnet[ 0 ][ "ip-addresses" ].filter( ( obj ) => obj[ "ip-address-type" ] === "ipv4" )[ 0 ][ "ip-address" ];

                }

                const row = table.row.add( {
                    "ID" : VM.vmid,
                    "Name" : VM.name,
                    "Status" : `<span class="badge bdg-${ VM.status }">${ VM.status.charAt( 0 ).toUpperCase() + VM.status.substring( 1 ) } </span>`,
                    "IP" : IP,
                    "Start date" : " de ",
                    "Salary" : " de ",

                } ).draw( );

                row.node().classList.add( "vm-row" );
            }

        }

    } );

} );
