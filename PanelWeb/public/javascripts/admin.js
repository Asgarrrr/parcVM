( async( ) => {

    console.log(
        "%cSalut ! Systéme crée par Lucas Ghyselen & Jérémy Caruelle",
        "background-image: url( 'http://orig11.deviantart.net/dcab/f/2011/158/1/6/nyan_cat_by_valcreon-d3iapfh.gif' ); background-repeat: no-repeat; background-size: cover; padding: 0px 0px 200px 0px; background-position: center center;",
    );

    console.log( "https://github.com/Asgarrrr", "https://github.com/LucasGLaPro" );

    // Create a new websocket connection
    this.socket = io( "192.168.64.103" );

    const shrink_btn = document.querySelector(".shrink-btn");
    const sidebar_links = document.querySelectorAll(".sidebar-links a");
    const active_tab = document.querySelector(".active-tab");
    const shortcuts = document.querySelector(".sidebar-links h4");
    const tooltip_elements = document.querySelectorAll(".tooltip-element");
    const redrawArea = document.getElementById( "redrawArea" );

    let activeIndex;
    let activeArea = 0;
    let refreshRequest = null;

    shrink_btn.addEventListener("click", () => {
        document.body.classList.toggle("shrink");
        setTimeout(moveActiveTab, 400);
        shrink_btn.classList.add("hovered");
        setTimeout(() => {
            shrink_btn.classList.remove("hovered");
        }, 500);
    });

    function moveActiveTab() {

        let topPosition = activeIndex * 58 + 2.5;

        if ( activeIndex > 4 )
            topPosition += shortcuts.clientHeight;

        active_tab.style.top = `${topPosition}px`;

    }

    function changeLink() {
        sidebar_links.forEach((sideLink) => sideLink.classList.remove("active"));
        this.classList.add("active");
        activeIndex = this.dataset.active;
        moveActiveTab();
    }
    sidebar_links.forEach( ( link ) => link.addEventListener("click", changeLink));

    function showTooltip() {
        let tooltip = this.parentNode.lastElementChild;
        let spans = tooltip.children;
        let tooltipIndex = this.dataset.tooltip;
        Array.from(spans).forEach((sp) => sp.classList.remove("show"));
        spans[tooltipIndex].classList.add("show");
        tooltip.style.top = `${(100 / (spans.length * 2)) * (tooltipIndex * 2 + 1)}%`;
    }
    tooltip_elements.forEach( ( elem ) => {
        elem.addEventListener( "mouseover", showTooltip );
    });

    try {

        redrawArea.innerHTML = await fetch( "./dashboard", {
            credentials: "same-origin",
        } ).then( res => res.text( ) );

    } catch ( error ) {
        console.log( error );
    }

    document.getElementById( "dashboard" ).addEventListener( "click", async ( ) => {

        if ( activeArea == 0 )
            return;

        activeArea = 0;
        if ( refreshRequest )
            clearInterval( refreshRequest );

        redrawArea.innerHTML = `<div class="h-100 d-flex justify-content-center align-items-center"><div class="spinner-grow text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

        const response = await fetch( "./dashboard", {
            credentials: "same-origin",
        } ).then( response => response.text() );
        redrawArea.innerHTML = response;


    } );

    document.getElementById( "machines" ).addEventListener( "click", async () => {

        if ( activeArea == 1 )
            return;

        activeArea = 1;
        if ( refreshRequest )
            clearInterval( refreshRequest );

        redrawArea.innerHTML = `<div class="h-100 d-flex justify-content-center align-items-center"><div class="spinner-grow text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

        const response = await fetch( "./vm", {
            credentials: "same-origin",
        } ).then( response => response.text() );
        redrawArea.innerHTML = response;

        this.VM             = [ ];
        this.VMOperations   = { };

        this.VMtable = new DataTable( "#table_id", {
            stateSave: true,
            columns: [
                { data: "ID"        },
                { data: "name"      },
                { data: "status"    },
                { data: "IP"        },
                { data: "RAM"       },
                { data: "CPU"       },
                { data: "Actions"       },
            ],
            language: {
                emptyTable: "Aucune machine disponible",
                info: "Affichage de _START_ à _END_ sur _TOTAL_ machines",
                infoEmpty: "Affichage de 0 à 0 sur 0 machines",
                infoFiltered: "(filtré de _MAX_ machines au total)",
                infoPostFix: "",
                lengthMenu: "Afficher _MENU_ machines",
                loadingRecords: "Chargement...",
                processing: "Traitement...",
                search: "Rechercher:",
                zeroRecords: "Aucune machine correspondante trouvée",
                paginate: {
                    first: "Premier",
                    last: "Dernier",
                    next: "Suivant",
                    previous: "Précédent"
                },
                aria: {
                    sortAscending: ": activer pour trier la colonne par ordre croissant",
                    sortDescending: ": activer pour trier la colonne par ordre décroissant"
                }
            }
        })

        $( "#table_id tbody" ).selectable({
            filter: "tr",

            start: function( event, ui ) {


            },

            selecting: function( event, ui ) {

                $( ui.selecting ).addClass( "ui-selecting" );


            },

            stop: function( event, ui ) {

                const selected = $( "#table_id tbody tr.ui-selected" );
                const init     = selected[ 0 ].classList.contains( "table-primary" );

                $( ".ui-selected", this ).each( function( ) {
                    $( this ).toggleClass( "table-primary", !init );
                } );
            }

        });

        this.VMtable.buttons().container()
            .appendTo( '#vmTableButtonContent' );

        this.socket.emit( "loadVM" );
        refreshRequest = setInterval( ( ) => this.socket.emit( "loadVM" ), 2000 );

    } );

    document.getElementById( "projet" ).addEventListener( "click", async () => {

        if ( activeArea == 2 )
            return;

        activeArea = 2;

        if ( refreshRequest )
            clearInterval( refreshRequest );

        redrawArea.innerHTML = `<div class="h-100 d-flex justify-content-center align-items-center"><div class="spinner-grow text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

        const response = await fetch( "./project", {
            method: "GET",
            credentials: "include",
        } ).then( response => response.text() );
        redrawArea.innerHTML = response;

        this.socket.emit( "loadProjets" );

    } );

    document.getElementById( "utilisateur" ).addEventListener( "click", async ( ) => {

        if ( activeArea == 5 )
            return;

        activeArea = 5;
        if ( refreshRequest )
            clearInterval( refreshRequest );

        redrawArea.innerHTML = `<div class="h-100 d-flex justify-content-center align-items-center"><div class="spinner-grow text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

        const response = await fetch( "./user", {
            credentials: "same-origin",
        } ).then( ( response ) => response.text() );
        redrawArea.innerHTML = response;

        this.socket.emit( "loadUsers" );

    } );

    let socketConnected = false;

    this.socket.on( "connect", () => {
        socketConnected = true;
        console.log( "Socket connected" );
    } );

    this.socket.on( "disconnect", () => {
        socketConnected = false;
        console.log( "Socket disconnected" );

    } );

    this.socket.on( "error", () => {
        socketConnected = false;
        console.log( "Socket error" );
    } );

    this.socket.on( "loadProjets", ( data ) => {

        const projectContainer = document.getElementById( "projectContainer" );

        // Only if the projectContainer is empty
        if ( projectContainer.children.length == 0 ) {


            for( const projet of data ) {

                const card = document.createElement( "div" );
                card.id = `project-${projet.id}`;
                card.classList.add( "card" );
                card.classList.add( "m-3" );
                const cardBody = document.createElement( "div" );
                cardBody.classList.add( "card-body" );
                const cardTitle = document.createElement( "h5" );
                cardTitle.classList.add( "card-title" );
                cardTitle.innerText = projet.name;
                const cardText = document.createElement( "p" );
                cardText.classList.add( "card-text" );
                cardText.innerText = projet.description;
                cardBody.appendChild( cardTitle );
                cardBody.appendChild( cardText );
                const listGroup = document.createElement( "ul" );
                listGroup.classList.add( "list-group" );
                listGroup.classList.add( "list-group-flush" );

                const listGroupEdit = document.createElement( "li" );
                const listGroupEditLink = document.createElement( "a" );
                listGroupEdit.classList.add( "list-group-item", "list-group-item-action" );
                listGroupEditLink.innerText = "Modifier";
                listGroupEditLink.classList.add( "text-primary" );
                listGroupEdit.appendChild( listGroupEditLink );
                listGroupEdit.addEventListener( "click", ( ) => {

                    this.socket.emit( "getProjectDetail", projet.id );

                    document.getElementById( "modalProjectName" ).innerHTML = "Modifier le projet";
                    document.getElementById( "editProjectModalDelete" ).style.display = "block";
                    const modalDom = document.getElementById( "editProjectModal" );
                    modalDom.dataset.id = projet.id;
                    const editModal = new bootstrap.Modal( modalDom, { } )
                    editModal.show( );

                } );
                listGroup.appendChild( listGroupEdit );
                const listGroupUser = document.createElement( "li" );
                listGroupUser.classList.add( "list-group-item", "list-group-item-action", "d-flex", "justify-content-between", "align-items-center" );
                listGroupUser.innerText = "Utilisateurs";
                listGroup.appendChild( listGroupUser );
                const listGroupUserText = document.createElement( "span" );
                listGroupUserText.innerText = projet.users.length;
                listGroupUser.appendChild( listGroupUserText );
                const listGroupMachine = document.createElement( "li" );
                listGroupMachine.classList.add( "list-group-item", "list-group-item-action", "d-flex", "justify-content-between", "align-items-center" );
                listGroupMachine.innerText = "Machines";
                const listGroupMachineText = document.createElement( "span" );
                listGroupMachineText.innerText = projet.vms.length;
                listGroup.appendChild( listGroupMachine );
                listGroupMachine.appendChild( listGroupMachineText );
                card.appendChild( cardBody );
                card.appendChild( listGroup );
                projectContainer.appendChild( card );

            }

        }

    });

    this.socket.on( "getProjectDetail", ( data ) => {

        document.getElementById( "editProjectModalName" ).value = data.project?.name ?? "";
        document.getElementById( "editProjectModalDesc" ).value = data.project?.description ?? "";

        const selectUser = document.getElementById( "editProjectModalSelectUser" );
        selectUser.innerHTML = "";

        const selectVM = document.getElementById( "editProjectModalSelectVM" );
        selectVM.innerHTML = "";

        for( const user of data.users ) {

            const div = document.createElement( "div" );
            div.classList.add( "form-check" );
            const input = document.createElement( "input" );
            input.classList.add( "form-check-input" );
            input.type = "checkbox";
            input.id = user.IdUser;
            input.value = user.IdUser;

            if ( data.project && data.project.users.find( u => u.id == user.IdUser ) )
                input.checked = true;

            const label = document.createElement( "label" );
            label.classList.add( "form-check-label" );
            label.innerText = user.Nom + " " + user.Prenom;
            div.appendChild( input );
            div.appendChild( label );
            selectUser.appendChild( div );

        }

        for( const VM of data?.VM ) {

            const div = document.createElement( "div" );
            div.classList.add( "form-check" );
            const input = document.createElement( "input" );
            input.classList.add( "form-check-input" );
            input.type = "checkbox";
            input.value = VM.id;


            if ( data.project && data.project.vms.find( u => u == VM.id ) )
                input.checked = true;

            const label = document.createElement( "label" );
            label.classList.add( "form-check-label" );
            label.innerText = VM.name;
            div.appendChild( input );
            div.appendChild( label );
            selectVM.appendChild( div );

        }

    } );

    this.socket.on( "createProject", ( data ) => {

        if ( data === "fail" ) {


        } else {

            const card = document.createElement( "div" );
            card.id = `project-${data.id}`;
            card.classList.add( "card" );
            card.classList.add( "m-3" );
            const cardBody = document.createElement( "div" );
            cardBody.classList.add( "card-body" );
            const cardTitle = document.createElement( "h5" );
            cardTitle.classList.add( "card-title" );
            cardTitle.innerText = data.name;
            const cardText = document.createElement( "p" );
            cardText.classList.add( "card-text" );
            cardText.innerText = data.description;
            cardBody.appendChild( cardTitle );
            cardBody.appendChild( cardText );
            const listGroup = document.createElement( "ul" );
            listGroup.classList.add( "list-group" );
            listGroup.classList.add( "list-group-flush" );

            const listGroupEdit = document.createElement( "li" );
            const listGroupEditLink = document.createElement( "a" );
            listGroupEdit.classList.add( "list-group-item", "list-group-item-action" );
            listGroupEditLink.innerText = "Modifier";
            listGroupEditLink.classList.add( "text-primary" );
            listGroupEdit.appendChild( listGroupEditLink );
            listGroupEdit.addEventListener( "click", ( ) => {

                this.socket.emit( "getProjectDetail", projet.id );

                document.getElementById( "modalProjectName" ).innerHTML = "Modifier le projet";
                const modalDom = document.getElementById( "editProjectModal" );
                modalDom.dataset.id = data.id;
                const editModal = new bootstrap.Modal( modalDom, { } )
                editModal.show( );

            } );
            listGroup.appendChild( listGroupEdit );
            const listGroupUser = document.createElement( "li" );
            listGroupUser.classList.add( "list-group-item", "list-group-item-action", "d-flex", "justify-content-between", "align-items-center" );
            listGroupUser.innerText = "Utilisateurs";
            listGroup.appendChild( listGroupUser );
            const listGroupUserText = document.createElement( "span" );
            listGroupUserText.innerText = data.users.length;
            listGroupUser.appendChild( listGroupUserText );
            const listGroupMachine = document.createElement( "li" );
            listGroupMachine.classList.add( "list-group-item", "list-group-item-action", "d-flex", "justify-content-between", "align-items-center" );
            listGroupMachine.innerText = "Machines";
            const listGroupMachineText = document.createElement( "span" );
            listGroupMachineText.innerText = data.VM.length;
            listGroup.appendChild( listGroupMachine );
            listGroupMachine.appendChild( listGroupMachineText );
            card.appendChild( cardBody );
            card.appendChild( listGroup );
            projectContainer.appendChild( card );

        }

    } );

    this.socket.on( "deleteProject", ( data ) => {

        if ( data === "fail" ) {

        } else {

            const card = document.getElementById( `project-${data}` );
            card.remove();

        }

    } );

    this.socket.on( "loadVM", ( data ) => {

        try {

            for( const VM of data.VMS ) {

                if ( VM.vmid === 104 )
                    continue;

                if ( VM.template ) {

                    const select = document.getElementById( "createVMNameTemplate" );

                    // Get all options contents
                    const options = [ ...select.options ].map( ( option ) => option.text );

                    if ( !options.includes( VM.name ) )
                        select.add( new Option( VM.name, VM.vmid ) );

                    continue;

                }

                const matchdata = this.VMtable.rows( ( idx, rowdata, node ) => {
                    return rowdata.ID === VM.vmid;
                }).data();

                // Check if the VM is already in the table
                if( matchdata.length === 0 ) {

                    this.VM.push( VM.vmid );
                    let IP = null;

                    if ( VM.network ) {

                        if ( VM.network.find( ( interface ) => interface.name == "ens18" ) ) {

                            const interface = VM.network.find( ( interface ) => interface.name == "ens18" );

                            if ( interface ) {

                                if ( !interface["ip-addresses"] )
                                    return;

                                IP = interface["ip-addresses"].find( ( type ) => type["ip-address-type"] == "ipv4" );

                                if ( IP )
                                    IP = IP["ip-address"];

                            }

                        }

                    }

                    // Add the VM to the table
                    this.VMtable.row.add( {
                        ID      : VM.vmid || "-",
                        name    : VM.name || "-",
                        status  : `<span class="badge text-bg-${ VM.status === "running" ? "success" : "danger" }">${ VM.status || "-" }</span>`,
                        IP      : VM.status === "running" ? IP || "-" : "-",
                        CPU     : VM.cpu ? ( VM.cpu  * 100 ).toFixed( 2 ) + "%": "-",
                        RAM     : VM.mem ? Math.round( ( VM.mem / VM.maxmem ) * 100 ) + " %" : "-",
                        Actions : "<button class='btn btn-primary btn-sm' style='--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;' onclick='editVMModal(this)' data-id='" + VM.vmid + "'>Modifier</button>"
                    } ).draw( false );

                } else {

                    let IP = matchdata[0].IP;

                    if ( VM.network ) {

                        if ( VM.network.find( ( interface ) => interface.name == "ens18" ) ) {

                            const interface = VM.network.find( ( interface ) => interface.name == "ens18" );

                            if ( interface ) {

                                IP = interface[ "ip-addresses" ].find( ( type ) => type["ip-address-type"] == "ipv4" );

                                if ( IP )
                                    IP = IP[ "ip-address" ];

                            }

                        }

                    }

                    if ( this.VMOperations[ String( VM.vmid ) ] )
                        if ( this.VMOperations[ String( VM.vmid ) ] == VM.status )
                            delete this.VMOperations[ String( VM.vmid ) ];

                    // Update the VM in the table
                    this.VMtable.row( function ( idx, rowdata, node ) {
                        return rowdata.ID === VM.vmid;
                    }).data( {
                        ID      : VM.vmid || "-",
                        name    : VM.name || "-",
                        status  : this.VMOperations[ String( VM.vmid ) ] ? `<span class="badge bg-secondary"><div class="spinner-grow spinner-grow-sm" role="status"><span class="visually-hidden">Loading</span></div></span>` : `<span class="badge text-bg-${ VM.status === "running" ? "success" : "danger" }">${ VM.status || "-" }</span>`,
                        IP      : VM.status === "running" ? `<span data-bs-toggle="tooltip" data-bs-placement="top" title="Tooltip on top"> ${ IP }</span>` || "-" : "-",
                        CPU     : VM.cpu ? ( VM.cpu  * 100 ).toFixed( 2 ) + "%": "-",
                        RAM     : VM.mem ? Math.round( ( VM.mem / VM.maxmem ) * 100 ) + "%" : "-",
                        Actions : "<button class='btn btn-primary btn-sm' style='--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;' onclick='editVMModal(this)' data-id='" + VM.vmid + "'>Modifier</button>"
                    } ).draw( false );

                }

            }

            for( const oldVM of this.VM ) {

                if ( !data.VMS.find( ( VM ) => VM.vmid === oldVM ) ) {

                    this.VMtable.row( function ( idx, rowdata, node ) {
                        return rowdata.ID === oldVM;
                    }).remove().draw( false );

                    this.VM = this.VM.filter( ( VM ) => VM !== oldVM );

                }

            }

        } catch ( error ) {

            console.error( error );

        }

    } );

    this.socket.on( "loadedUsers", ( data ) => {

        const userList = document.getElementById( "userList" );

        for( [ key, value ] of Object.entries( data ) ) {

            const tr = document.createElement( "tr" );
            const id = document.createElement( "td" );
            const subname = document.createElement( "td" );
            const name = document.createElement( "td" );
            const email = document.createElement( "td" );
            const project = document.createElement( "td" );

            id.innerText = value.IdUser;
            subname.innerText = value.UPrenom;
            name.innerText = value.UNom;
            email.innerText = value.Email;
            project.innerText = value.Projets;

            tr.appendChild( id );
            tr.appendChild( subname );
            tr.appendChild( name );
            tr.appendChild( email );
            tr.appendChild( project );

            userList.appendChild( tr );

        }

    } );

} )( );


function createPopup( text ) {

    const toast = document.createElement( "div" );
    toast.classList.add( "toast", "align-items-center", "text-white", "bg-danger" );
    toast.setAttribute( "role", "alert" );
    toast.setAttribute( "aria-live", "assertive" );
    toast.setAttribute( "aria-atomic", "true" );

    const toastFlex = document.createElement( "div" );
    toastFlex.classList.add( "d-flex" );

    const toastBody = document.createElement( "div" );
    toastBody.classList.add( "toast-body" );

    toastBody.innerHTML = text;

    toastFlex.appendChild( toastBody );
    toast.appendChild( toastFlex );

    document.getElementById( "popup" ).appendChild( toast );

    const bootstrapToast = bootstrap.Toast.getOrCreateInstance( toast );

    bootstrapToast.show();

}


function editProjectModalSearchUser( filter ) {

    const selectUser = document.getElementById( "editProjectModalSelectUser" );

    for (const select of selectUser.getElementsByTagName( "label" ) ) {

        selectValue = select.textContent || select.innerText;

        select.parentNode.style.display = selectValue.toLowerCase().indexOf( filter.toLowerCase() ) > -1 ? "" : "none";

    }

}

function editProjectModalSearchVM( filter ) {

    const selectUser = document.getElementById( "editProjectModalSelectVM" );

    for (const select of selectUser.getElementsByTagName( "label" ) ) {

        selectValue = select.textContent || select.innerText;

        select.parentNode.style.display = selectValue.toLowerCase().indexOf( filter.toLowerCase() ) > -1 ? "" : "none";

    }

}

function editProjectModalSave( ) {

    const id    = document.getElementById( "editProjectModal" ).dataset.id;
    const name  = document.getElementById( "editProjectModalName" ).value;
    const desc  = document.getElementById( "editProjectModalDesc" ).value;
    const users = [];
    const VM    = [];

    for ( const select of document.getElementById( "editProjectModalSelectUser" ).getElementsByTagName( "input" ) ) {

        if ( select.checked )
            users.push( select.value );

    }

    for ( const select of document.getElementById( "editProjectModalSelectVM" ).getElementsByTagName( "input" ) ) {

        if ( select.checked )
            VM.push( select.value );

    }

    if ( id === "newProject" ) {

        this.socket.emit( "createProject", { id: id, name: name, description: desc, users: users, VM: VM } );

    } else {

        this.socket.emit( "editProject", { id: id, name: name, description: desc, users: users, VM: VM } );

        const projectCard = document.getElementById( "project-" + id );
        projectCard.querySelector( ".card-title" ).innerText = name;
        projectCard.querySelector( ".card-text" ).innerText = desc;
        projectCard.querySelectorAll( "span" )[ 0 ].innerText = users.length;
        projectCard.querySelectorAll( "span" )[ 1 ].innerText = VM.length;

    }

}

function createProject( ) {

    document.getElementById( "editProjectModalDelete" ).style.display = "none";

    this.socket.emit( "getProjectDetail", 0 );

    document.getElementById( "editProjectModalName" ).value = "";
    document.getElementById( "editProjectModalDesc" ).value = "";
    document.getElementById( "modalProjectName" ).innerHTML = "Créer un projet";

    for ( const select of document.getElementById( "editProjectModalSelectUser" ).getElementsByTagName( "input" ) )
        select.checked = false;

    for ( const select of document.getElementById( "editProjectModalSelectVM" ).getElementsByTagName( "input" ) )
        select.checked = false;

    const modalDom = document.getElementById( "editProjectModal" );
    modalDom.dataset.id = "newProject";
    const editModal = new bootstrap.Modal( modalDom, { } )
    editModal.show( );

}

function removeProject( ) {

    const id = document.getElementById( "editProjectModal" ).dataset.id;

    this.socket.emit( "deleteProject", id );

}

function startVM( ) {

    for ( const row of document.querySelectorAll( ".table-primary" ) ) {

        if ( [ "Loading", "running" ].includes( row.childNodes[ 2 ].innerText ) )
            continue;

        this.socket.emit( "startVMRequest", row.childNodes[ 0 ].innerText );
        this.VMOperations[ row.childNodes[ 0 ].innerText ] = "running";
    }

}

function stopVM( ) {

    for ( const row of document.querySelectorAll( ".table-primary" ) ) {

        if ( [ "Loading", "stopped" ].includes( row.childNodes[ 2 ].innerText ) )
            continue;

        this.socket.emit( "stopVMRequest", row.childNodes[ 0 ].innerText );
        this.VMOperations[ row.childNodes[ 0 ].innerText ] = "stopped";
    }

}

function deleteVM( ) {

    for ( const row of document.querySelectorAll( ".table-primary" ) ) {
        this.socket.emit( "deleteVMRequest", row.childNodes[ 0 ].innerText );
        this.VMOperations[ row.childNodes[ 0 ].innerText ] = "delete";
    }

}

function createVMActions( ) {

    const createVMQuantity      = document.getElementById( "createVMQuantity" );
    const createVMNameTemplate  = document.getElementById( "createVMNameTemplate" );
    const createVMName          = document.getElementById( "createVMName" );

    if ( !createVMQuantity.value || createVMQuantity.value < 1 ) {
        createVMQuantity.classList.add( "is-invalid" );
        return;
    }

    const newVMs = [ ];

    // Loop over the quantity
    for ( let i = 0; i < parseInt( createVMQuantity.value ); i++ ) {

        const specs = { };
        specs.name = createVMNameTemplate.value;

        // Check if name contains loop constants
        if ( createVMName.value.match( /\$X/gm ) ) {

            if ( createVMName.value.match( /\$X-\d+/gm ) ) {

                specs.name = createVMName.value.replace( /\$X-\d+/gm, i + parseInt( createVMName.value.match( /\$X-\d+/gm )[ 0 ].replace( /\$X-/, "" ) ) );

            } else {

                specs.name = createVMName.value.replace( /\$X/gm, i + 1 );

            }

            specs.template = createVMNameTemplate.value;
            newVMs.push( specs );

        }

    }

    this.socket.emit( "createVMRequest", newVMs );

}

function editVMModal( trigger ) {

    const modalDom  = document.getElementById( "editVMModal" )
        , modal     = new bootstrap.Modal( modalDom ).show( )
        , VMID      = trigger.dataset.id;

    document.getElementById( "VMEditHeader" ).innerText = "Editer la VM " + VMID;
    document.getElementById( "VMEditLoader" ).style.display = "block";
    document.getElementById( "VMEditData" ).style.display   = "none";

    this.socket.emit( "loadVMDetail", trigger.dataset.id );

}

this.socket.on( "loadVMDetail", async ( data ) => {

    document.getElementById( "VMEditLoader" ).style.display = "none";
    document.getElementById( "VMEditData" ).style.display   = "block";


});
