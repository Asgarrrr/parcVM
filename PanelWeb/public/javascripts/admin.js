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
        }, 500 );
    });

    function moveActiveTab() {

        let topPosition = activeIndex * 58 + 2.5;

        if ( activeIndex > 4 )
            topPosition += shortcuts.clientHeight + 23;

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

        this.socket.emit( "loadRessources" );
        refreshRequest = setInterval( ( ) => this.socket.emit( "loadRessources" ), 1000 );

    } catch ( error ) {
        console.log( error );
    }

    // document.onclick = hideMenu;
    // document.oncontextmenu = rightClick;

    function hideMenu() {
        document.getElementById("contextMenu")
            .style.display = "none"
    }

    function rightClick(e) {
        e.preventDefault();

        if (document.getElementById("contextMenu").style.display == "block") {
            hideMenu();
        } else {
            var menu = document.getElementById("contextMenu")
            menu.style.display = 'block';
            menu.style.left = e.pageX + "px";
            menu.style.top = e.pageY + "px";
        }
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

        this.socket.emit( "loadRessources" );
        refreshRequest = setInterval( ( ) => this.socket.emit( "loadRessources" ), 1000 );

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
            fixedHeader: true,
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

    document.getElementById( "classes" ).addEventListener( "click", async () => {

        if ( activeArea == 3 )
            return;

        activeArea = 3;

        if ( refreshRequest )
            clearInterval( refreshRequest );

        redrawArea.innerHTML = `<div class="h-100 d-flex justify-content-center align-items-center"><div class="spinner-grow text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

        const response = await fetch( "./classes", {
            method      : "GET",
            credentials : "include",
        } ).then( response => response.text() );

        redrawArea.innerHTML = response;

        this.socket.emit( "loadClass" );


        const domModal = document.getElementById( "createUserModal" );

        domModal.addEventListener( "show.bs.modal", ( event ) => {

        });

        domModal.addEventListener( "hide.bs.modal", ( event ) => {


        });


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

        const domModal = document.getElementById( "createUserModal" )
            , bsModal  = new bootstrap.Modal( domModal );

        domModal.addEventListener( "show.bs.modal", ( event ) => {

            const button = event.relatedTarget
                , recipient = button.getAttribute( "data-bs-user" );

            document.getElementById( "createUserModalTitle" ).innerHTML = recipient === "newUser" ? "Créer un utilisateur" : "Modifier un utilisateur";
            document.getElementById( "createUserRequest" ).innerHTML = recipient === "newUser" ? "Ajouter !" : "Sauvegarder";

            document.getElementById( "userLoader" ).style.display = "block";
            document.getElementById( "userData" ).style.display   = "none";
            domModal.dataset.id = recipient;

            this.socket.emit( "loadUserDetails", recipient );

        });

        domModal.addEventListener( "hide.bs.modal", ( event ) => {

            document.getElementById( "userLoader" ).style.display = "none";
            document.getElementById( "userData" ).style.display   = "block";

            document.getElementById( "usertModalSearchMachineList" ).innerHTML = "";
            document.getElementById( "usertModalSearchMachine" ).value = "";
            document.getElementById( "usertModalSearchClassList" ).innerHTML = "";
            document.getElementById( "usertModalSearchClass" ).value = "";
            document.getElementById( "usertModalSearchProjectList" ).innerHTML = "";
            document.getElementById( "usertModalSearchProject" ).value = "";
            document.getElementById( "createUserName" ).value = "";
            document.getElementById( "createUserFirstName" ).value = "";
            document.getElementById( "createUserEmail" ).value = "";

        });


    } );

    document.getElementById( "tasks" ).addEventListener( "click", async ( ) => {

        if ( activeArea == 6 )
            return;

        activeArea = 6;
        if ( refreshRequest )
            clearInterval( refreshRequest );

        redrawArea.innerHTML = `<div class="h-100 d-flex justify-content-center align-items-center"><div class="spinner-grow text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

        const response = await fetch( "./tasks", {
            credentials: "same-origin",
        } ).then( ( response ) => response.text() );
        redrawArea.innerHTML = response;

        this.socket.emit( "loadtasks" );
        refreshRequest = setInterval( ( ) => this.socket.emit( "loadtasks" ), 300 );

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

                const listGroupActions = document.createElement( "li" );
                listGroupActions.classList.add( "list-group" );

                const buttonGroup = document.createElement( "div" );
                buttonGroup.classList.add( "btn-group" );

                const buttonGroupStart = document.createElement( "button" );
                buttonGroupStart.classList.add( "btn", "btn-light" );
                buttonGroupStart.innerText = "Démarrer tout";
                buttonGroupStart.onclick = ( ) => projetStartAllVM( projet.id );
                buttonGroup.appendChild( buttonGroupStart );

                const buttonGroupStop = document.createElement( "button" );
                buttonGroupStop.classList.add( "btn", "btn-light" );
                buttonGroupStop.innerText = "Arrêter tout";
                buttonGroupStop.onclick = ( ) => projetStopAllVM( projet.id );
                buttonGroup.appendChild( buttonGroupStop );

                listGroupActions.appendChild( buttonGroup );

                listGroup.appendChild( listGroupActions );
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

            data.queue[ 0 ] = data.queue[ 0 ].map( ( q ) => {

                const parsed = q.upid.split( ":" );
                return {
                    id  : parsed[6],
                    pve : parsed[1],
                    task: parsed[5]
                };

            } );

        } catch ( error ) { }

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
                        status  : data.queue[ 0 ].find( ( task ) => task.id == VM.vmid ) ? `<span class="badge bg-secondary"><div class="spinner-grow spinner-grow-sm" role="status"><span class="visually-hidden">Loading</span></div></span>` : `<span class="badge text-bg-${ VM.status === "running" ? "success" : "danger" }">${ VM.status || "-" }</span>${ data.queue[1].find( ( task ) => task.args.ID == VM.vmid ) ? `<span class="badge bg-secondary ms-1">${
                            {
                                unknown : "Tache prévue",
                                startVM : "Démarrage prévu",
                                stopVM  : "Arrêt prévu",
                                deleteVM: "Suppression prévue",
                            }[ data.queue[1].find( ( task ) => task.args.ID == VM.vmid ).tasktype || "unknown" ]

                        }</span>` : "" }`,
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


                    console.log( data.queue[ 1 ].find( ( task ) => task.args.ID == VM.vmid ))
                    // Update the VM in the table
                    this.VMtable.row( function ( idx, rowdata, node ) {
                        return rowdata.ID === VM.vmid;
                    }).data( {
                        ID      : VM.vmid || "-",
                        name    : VM.name || "-",
                        status  : data.queue[ 0 ].find( ( task ) => task.id == VM.vmid ) ? `<span class="badge bg-secondary"><div class="spinner-grow spinner-grow-sm" role="status"><span class="visually-hidden">Loading</span></div></span>` : `<span class="badge text-bg-${ VM.status === "running" ? "success" : "danger" }">${ VM.status || "-" }</span>${ data.queue[1].find( ( task ) => task.args.ID == VM.vmid ) ? `<span class="badge bg-secondary ms-1">${

                            {
                                unknown : "Tache prévue",
                                startVM : "Démarrage prévu",
                                stopVM  : "Arrêt prévu",
                                deleteVM: "Suppression prévue",
                            }[ data.queue[1].find( ( task ) => task.args.ID == VM.vmid ).tasktype || "unknown" ]

                        }</span>` : "" }`,
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

        this.tableUser = new DataTable( "#table_user", {
            stateSave: true,
            fixedHeader: true,
            columns: [
                { data: "ID"        },
                { data: "Nom"       },
                { data: "Prénom"    },
                { data: "Mail"      },
                { data: "VMs"       },
                { data: "Projets"   },
                { data: "Classes"   },
                { data: "Actions"   }
            ],
            language: {
                emptyTable: "Aucun utilisateur trouvé",
                info: "Affichage de _START_ à _END_ sur _TOTAL_ utilisateurs",
                infoEmpty: "Affichage de 0 à 0 sur 0 utilisateurs",
                infoFiltered: "(filtré de _MAX_ utilisateurs)",
                infoPostFix: "",
                lengthMenu: "Afficher _MENU_ utilisateurs",
                loadingRecords: "Chargement...",
                processing: "Traitement...",
                search: "Rechercher:",
                zeroRecords: "Aucun utilisateur trouvé",
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
        });

        for( [ key, value ] of Object.entries( data ) ) {

            this.tableUser.row.add( {
                ID        : value.IdUser,
                Nom       : value.UNom,
                Prénom    : value.UPrenom,
                Mail      : value.Email,
                VMs       : value.VM.map( ( VM ) => VM ).join( ", " ),
                Projets   : value.Projets.map( ( x ) => x ).join( ", " ),
                Classes   : value.Classes.map( ( x ) => x ).join( ", " ),
                Actions   : "<div class='btn-group'><button class='btn btn-primary btn-sm' style='--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem' type='button' data-bs-toggle='modal' data-bs-target='#createUserModal' data-bs-user='" + value.IdUser + "'>Modifier</button><button class='btn btn-danger btn-sm' style='--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem' type='button' onclick='deleteUser("+value.IdUser+")'>Supprimer</button></div>"
            } ).draw( false );

        }

    } );

    this.socket.on( "loadVMDetail", async ( data ) => {

        console.log( data )

        document.getElementById( "VMEditLoader" ).style.display = "none";
        document.getElementById( "VMEditData" ).style.display   = "block";

        const modalDom  = document.getElementById( "editVMModal" );
        const snapshotSelectionTable = document.getElementById( "snapshotSelectionTable" );
        const VMID = modalDom.dataset.id;

        snapshotSelectionTable.innerHTML = "";

        for ( const snapshot of data.snapshot ) {

            const snapshotRow = document.createElement( "tr" );
            snapshotRow.innerHTML = `
                <td>${ snapshot.name }</td>
                <td>${ snapshot.description }</td>
                <td>${ snapshot.snaptime ? new Date( snapshot.snaptime * 1000 ).toLocaleString(): "-" }</td>
                <td>${ snapshot.name !== "current" ? `<button class='btn btn-primary btn-sm me-2' style='--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;' onclick='useVMSnapshot( ${ VMID }, "${ snapshot.name }" )'>Utiliser</button><button class='btn btn-danger btn-sm' style='--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;' onclick='deleteVMSnapshot( ${ VMID }, "${ snapshot.name }" )'>Supprimer</button>` : "" } </td>
            `;

            snapshotSelectionTable.appendChild( snapshotRow );

        }

        const shellPanel = document.getElementById( "openShell" );
        shellPanel.onclick = () => this.socket.emit( "startvncproxy", { VMID } );


    });

    this.socket.on( "loadUserDetails", ( data ) => {

        document.getElementById( "userLoader" ).style.display = "none";
        document.getElementById( "userData" ).style.display   = "block";

        this.Projets = [];
        this.Classes = [];

        const user = Object.values( data )[ 0 ][ Object.keys( Object.values( data )[ 0 ] )[ 0 ] ];

        if ( user !== "n" ) {

            document.getElementById( "createUserName" ).value = user.UNom;
            document.getElementById( "createUserFirstName" ).value = user.UPrenom
            document.getElementById( "createUserEmail" ).value = user.Email;

        }

        const machineArea = document.getElementById( "usertModalSearchMachineList" );

        for( const VM of data?.VMS ) {

            const div = document.createElement( "div" );
            div.classList.add( "form-check" );
            const input = document.createElement( "input" );
            input.classList.add( "form-check-input" );
            input.type = "checkbox";
            input.value = VM.id;

            if ( user !== "n" && user.VM.find( ( x ) => x === VM.id ) )
                input.checked = true;

            const label = document.createElement( "label" );
            label.classList.add( "form-check-label" );
            label.innerText = VM.name;
            div.appendChild( input );
            div.appendChild( label );
            machineArea.appendChild( div );

        }

        const projectArea = document.getElementById( "usertModalSearchProjectList" );

        for ( const project of data?.projects ) {

            const div = document.createElement( "div" );
            div.classList.add( "form-check" );
            const input = document.createElement( "input" );
            input.classList.add( "form-check-input" );
            input.type = "checkbox";
            input.value = project.id;

            if ( user !== "n" && user.Projets.find( ( x ) => x == project.name ) )
                input.checked = true;

            const label = document.createElement( "label" );
            label.classList.add( "form-check-label" );
            label.innerText = project.name;
            div.appendChild( input );
            div.appendChild( label );
            projectArea.appendChild( div );

            this.Projets.push({
                id: project.id,
                name: project.name
            });

        }

        const classArea = document.getElementById( "usertModalSearchClassList" );

        for ( const [ key, value ] of Object.entries( data?.classes ) ) {

            const div = document.createElement( "div" );
            div.classList.add( "form-check" );
            const input = document.createElement( "input" );
            input.classList.add( "form-check-input" );
            input.type = "checkbox";
            input.value = key;

            if ( user !== "n" && user.Classes.find( ( x ) => x === value.name ) )
                input.checked = true;

            const label = document.createElement( "label" );
            label.classList.add( "form-check-label" );
            label.innerText = value.name;
            div.appendChild( input );
            div.appendChild( label );
            classArea.appendChild( div );

            this.Classes.push({
                id: key,
                name: value.name
            });

        }



    });

    this.socket.on( "createUser", ( data ) => {

        this.tableUser.row.add( {
            ID        : data.idUser,
            Nom       : data.name,
            Prénom    : data.firstName,
            Mail      : data.mail,
            VMs       : data.VM.map( ( x ) => x ).join( ", " ),
            Projets   : data.Project.map( ( x ) => this.Projets.find( p => p.id == x ).name ).join( ", " ),
            Classes   : data.Class.map( ( x ) => this.Classes.find( c => c.id == x ).name ).join( ", " ),
            Actions   : "<div class='btn-group'><button class='btn btn-primary btn-sm' style='--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem' type='button' data-bs-toggle='modal' data-bs-target='#createUserModal' data-bs-user='"+data.idUser+"'>Modifier</button><button class='btn btn-danger btn-sm' style='--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem' type='button' onclick='deleteUser("+ data.idUser +")'>Supprimer</button>"
        } ).draw( false );

    });

    this.socket.on( "updateUser", ( data ) => {

        console.log( data.VM )

        this.tableUser.row( function ( idx, rowdata, node ) {
            return rowdata.ID === parseInt( data.ID );
        }).data( {
            "ID"        : this.tableUser.row( function ( idx, rowdata, node ) { return rowdata.ID === parseInt( data.ID ); } ).data().ID,
            "Nom"       : data.name,
            "Prénom"    : data.firstName,
            "Mail"      : data.mail,
            "VMs"       : data.VM.map( ( x ) => x ).join( ", " ),
            "Projets"   : data.Project.map( ( x ) => this.Projets.find( p => p.id == x ).name ).join( ", " ),
            "Classes"   : data.Class.map( ( x ) => this.Classes.find( c => c.id == x ).name ).join( ", " ),
            "Actions"   :"<div class='btn-group'><button class='btn btn-primary btn-sm' style='--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem' type='button' data-bs-toggle='modal' data-bs-target='#createUserModal' data-bs-user='"+data.idUser+"'>Modifier</button><button class='btn btn-danger btn-sm' style='--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem' type='button' onclick='deleteUser("+data.idUser+")'>Supprimer</button>"
        } ).draw( true );

    });

    this.socket.on( "deleteUser", ( data ) => {

    });

    this.socket.on( "loadClass", ( data ) => {

        const classContainer = document.getElementById( "classContainer" );

        for( const [ key, value ] of Object.entries( data ) ) {

            const accordionItem = document.createElement( "div" );
            accordionItem.classList.add( "accordion-item" );
            accordionItem.dataset.classId = key;

            const accordionItemHeading = document.createElement( "h2" );
            accordionItemHeading.classList.add( "accordion-header" );
            accordionItemHeading.id = "accordion-item-heading-" + key;

            const deleteClass = document.createElement( "button" );
            deleteClass.classList.add( "btn", "btn-danger", "btn-sm", "me-2", "mt-2", "mb-1" );
            deleteClass.type = "button";
            deleteClass.innerText = "Supprimer la classe";
            deleteClass.onclick = () => {
                this.socket.emit( "deleteClass", key );
                document.querySelector( ".accordion-item[data-class-id='" + key + "']" ).remove();
            }

            const accordionItemButton = document.createElement( "button" );
            accordionItemButton.classList.add( "accordion-button", "collapsed" );
            accordionItemButton.setAttribute( "data-bs-toggle", "collapse" );
            accordionItemButton.setAttribute( "data-bs-target", "#accordion-item-collapse-" + key );
            accordionItemButton.setAttribute( "aria-expanded", "false" );
            accordionItemButton.setAttribute( "aria-controls", "accordion-item-collapse-" + key );
            accordionItemButton.innerText = value.name;

            const accordionItemCollapse = document.createElement( "div" );
            accordionItemCollapse.classList.add( "accordion-collapse", "collapse" );
            accordionItemCollapse.id = "accordion-item-collapse-" + key;
            accordionItemCollapse.setAttribute( "aria-labelledby", "accordion-item-heading-" + key );

            const accordionItemCollapseDiv = document.createElement( "div" );
            accordionItemCollapseDiv.classList.add( "accordion-body" );

            // Create table
            const table = document.createElement( "table" );
            table.classList.add( "table", "table-striped" );
            table.id = "table-" + key;

            const thead = document.createElement( "thead" );
            const tr = document.createElement( "tr" );
            const th1 = document.createElement( "th" );
            th1.innerText = "Nom";
            const th2 = document.createElement( "th" );
            th2.innerText = "Prénom";
            const th3 = document.createElement( "th" );
            th3.innerText = "Mail";

            const tbody = document.createElement( "tbody" );

            const noUser = document.createElement( "p" );
            noUser.innerText = "Aucun utilisateur";
            noUser.classList.add( "text-center" );

            accordionItemCollapseDiv.appendChild( deleteClass );

            for( const user of value.users ) {

                const tr = document.createElement( "tr" );

                const td1 = document.createElement( "td" );
                td1.innerText = user.name;
                td1.classList.add( "text-uppercase" );
                const td2 = document.createElement( "td" );
                td2.innerText = user.firstname;
                const td3 = document.createElement( "td" );
                const a = document.createElement( "a" );
                a.href = "mailto:" + user.email;
                a.innerText = user.email;
                td3.appendChild( a );

                tr.appendChild( td1 );
                tr.appendChild( td2 );
                tr.appendChild( td3 );

                tbody.appendChild( tr );

            }

            tr.appendChild( th1 );
            tr.appendChild( th2 );
            tr.appendChild( th3 );

            thead.appendChild( tr );
            table.appendChild( thead );
            table.appendChild( tbody );

            accordionItem.appendChild( accordionItemHeading );
            accordionItemHeading.appendChild( accordionItemButton );
            accordionItem.appendChild( accordionItemCollapse );
            accordionItemCollapse.appendChild( accordionItemCollapseDiv );

            accordionItemCollapseDiv.appendChild( table );

            classContainer.appendChild( accordionItem );

        }

    });

    socket.on( "loadtasks", ( data ) => {

        console.log( data );

    });

    socket.on( "loadRessources", ( data ) => {

        try {

            const nodes = data.resources.filter ( ( x ) => x.type == "node" );

            // Calculate memory usage
            const totalNodeMemory       = nodes.reduce( ( a, b ) => a + b.maxmem, 0 );
            const totalUsedNodeMemory   = nodes.reduce( ( a, b ) => a + b.mem, 0 );

            // Calculate the percentage of used memory
            const usedNodeMemoryPercentage = ( totalUsedNodeMemory / totalNodeMemory ) * 100;

            // Calculate cpu usage
            const totalNodeCpu           = nodes.reduce( ( a, b ) => a + b.maxcpu, 0 );
            const totalUsedNodeCpu       = nodes.reduce( ( a, b ) => a + b.cpu, 0 );

            // Calculate the percentage of used cpu
            const usedNodeCpuPercentage = ( totalUsedNodeCpu / nodes.length ) * 100;

            // Calculate the percentage of used storage
            const totalNodeStorage       = nodes.reduce( ( a, b ) => a + b.maxstorage, 0 );
            const totalUsedNodeStorage   = nodes.reduce( ( a, b ) => a + b.storage, 0 );

            document.getElementById( "memoryUsed" ).innerText = Math.round( usedNodeMemoryPercentage ) + "%";
            document.getElementById( "totalMem" ).innerText = `${ ( totalUsedNodeMemory / 1024 / 1024 / 1024 ).toFixed( 2 ) } Go / ${ ( totalNodeMemory / 1024 / 1024 / 1024 ).toFixed( 2 ) } Go`;

            const nodesMemUsage = document.getElementById( "nodesMemUsage" ).getContext( "2d" );
            const nodesCPUUsage = document.getElementById( "nodesCPUUsage" ).getContext( "2d" );
            const nodesStorageUsage = document.getElementById( "nodesStorageUsage" ).getContext( "2d" );

            const chartNodesMemUsage = new Chart( nodesMemUsage, {
                type: "doughnut",
                data: {
                    labels: [ "Used", "Free" ],
                    datasets: [{
                        label: ["# of Votes"],
                        data: [ ~~( usedNodeMemoryPercentage ), 100 - ~~( usedNodeMemoryPercentage ) ],
                        backgroundColor: [ "#3651d4", "#eff1f3" ],
                    }]
                },
                options: {

                    cutout: "90%",
                    responsive: true,
                    maintainAspectRatio: true,
                    legend: {
                        display: true
                    },
                    tooltips: {
                        enabled: false
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    },
                },
            });

            const chartNodesCPUUsage = new Chart( nodesCPUUsage, {
                type: "doughnut",
                data: {
                    labels: [ "Used", "Free" ],
                    datasets: [{
                        label: ["# of Votes"],
                        data: [ ~~( usedNodeCpuPercentage ), 100 - ~~( usedNodeCpuPercentage ) ],
                        backgroundColor: [ "#3651d4", "#eff1f3" ],
                    }]
                },
                options: {

                    cutout: "90%",
                    responsive: true,
                    maintainAspectRatio: true,
                    legend: {
                        display: true
                    },
                    tooltips: {
                        enabled: false
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    },
                },
            });

            const chartNodesStorageUsage = new Chart( nodesStorageUsage, {
                type: "doughnut",
                data: {
                    labels: [ "Used", "Free" ],
                    datasets: [{
                        label: ["# of Votes"],
                        data: [ ~~( usedNodeStoragePercentage ), 100 - ~~( usedNodeStoragePercentage ) ],
                        backgroundColor: [ "#3651d4", "#eff1f3" ],
                    }]
                },
                options: {

                    cutout: "90%",
                    responsive: true,
                    maintainAspectRatio: true,
                    legend: {
                        display: true
                    },
                    tooltips: {
                        enabled: false
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    },
                },
            });




        } catch( error ) {

            console.error( error );

        }



    });

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

    // const modal = new bootstrap.Modal( document.getElementById( "createVMModal" ), { } )
    // console.log( modal.hide( ) )


}

function editVMModal( trigger ) {

    const modalDom  = document.getElementById( "editVMModal" )
        , modal     = new bootstrap.Modal( modalDom ).show( )
        , VMID      = trigger.dataset.id;

    document.getElementById( "VMEditHeader" ).innerText = "Editer la VM " + VMID;
    document.getElementById( "VMEditLoader" ).style.display = "block";
    document.getElementById( "VMEditData" ).style.display   = "none";
    modalDom.dataset.id = VMID;

    this.socket.emit( "loadVMDetail", trigger.dataset.id );

}

function useVMSnapshot( VMID, snapshot ) {

    this.socket.emit( "useVMSnapshot", { VMID, snapshot } );

}

function deleteVMSnapshot( VMID, snapshot ) {

    this.socket.emit( "deleteVMSnapshot", { VMID, snapshot } );

    const table = document.getElementById( "snapshotSelectionTable" );

    // Remove the row
    for ( const row of table.querySelectorAll( "tr" ) )
        if ( row.childNodes[ 1 ].innerText === snapshot )
            return table.removeChild( row );

}

function createVMSnapshot( ) {

    const modalDom      = document.getElementById( "editVMModal" )
        , table         = document.getElementById( "snapshotSelectionTable" )
        , name          = document.getElementById( "createVMSnapshotName" )
        , description   = document.getElementById( "createVMSnapshotDesc" );

    if ( !name.value )
        return name.classList.add( "is-invalid" );

    // Check if name is already used
    for ( const row of table.childNodes )
        if ( row.childNodes[ 1 ].innerText === name.value )
            return name.classList.add( "is-invalid" );

    this.socket.emit( "createVMSnapshot", {
        VMID        : modalDom.dataset.id,
        snapname    : name.value,
        description : description.value
    } );


    const tr = document.createElement( "tr" );
    tr.innerHTML = `
        <td>${ name.value }</td>
        <td>${ description.value }</td>
        <td>${ new Date( ).toLocaleString( ) }</td>
        <td><button class='btn btn-primary btn-sm me-2' style='--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;' onclick='useVMSnapshot( ${ modalDom.dataset.id }, "${ name.value }" )'>Utiliser</button><button class='btn btn-danger btn-sm' style='--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;' onclick='deleteVMSnapshot( ${ modalDom.dataset.id }, "${ name.value }" )'>Supprimer</button></td>
    `;

    // Append the new row before "current" row
    snapshotSelectionTable.insertBefore( tr, snapshotSelectionTable.querySelector( "tr:last-child" ) );

    name.value = "";
    description.value = "";

}

function createToasts( text, type ) {

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

function projetStartAllVM( projectID ) {
    this.socket.emit( "projetStartAllVM", projectID );
}

function projetStopAllVM( projectID ) {
    this.socket.emit( "projetStopAllVM", projectID );
}

function usertModalSearchMachine( filter ) {

    const selectUser = document.getElementById( "usertModalSearchMachineList" );

    for (const select of selectUser.getElementsByTagName( "label" ) ) {

        selectValue = select.textContent || select.innerText;

        select.parentNode.style.display = selectValue.toLowerCase().indexOf( filter.toLowerCase() ) > -1 ? "" : "none";

    }

}

function usertModalSearchProject( filter ) {

    const selectUser = document.getElementById( "usertModalSearchProjectList" );

    for (const select of selectUser.getElementsByTagName( "label" ) ) {

        selectValue = select.textContent || select.innerText;

        select.parentNode.style.display = selectValue.toLowerCase().indexOf( filter.toLowerCase() ) > -1 ? "" : "none";

    }

}

function createUserRequest( ) {

    const modalDom  = document.getElementById( "createUserModal" )
        , name      = document.getElementById( "createUserName" )
        , fName     = document.getElementById( "createUserFirstName" )
        , mail      = document.getElementById( "createUserEmail" )
        , ID        = modalDom.dataset.id;

    if ( !name.value )
        return name.classList.add( "is-invalid" );

    if ( !fName.value )
        return fName.classList.add( "is-invalid" );

    if ( !mail.value )
        return mail.classList.add( "is-invalid" );

    const VM        = []
        , Project   = []
        , Class     = [];

    for ( const select of document.getElementById( "usertModalSearchMachineList" ).getElementsByTagName( "input" ) )
        if ( select.checked )
            VM.push( parseInt( select.value ) );

    for ( const select of document.getElementById( "usertModalSearchProjectList" ).getElementsByTagName( "input" ) )
        if ( select.checked )
            Project.push( parseInt( select.value ) );

    for ( const select of document.getElementById( "usertModalSearchClassList" ).getElementsByTagName( "input" ) )
        if ( select.checked )
            Class.push( parseInt( select.value ) );

    if ( ID === "newUser" ) {
        this.socket.emit( "createUser", {
            name        : name.value,
            firstName   : fName.value,
            mail        : mail.value,
            VM          : VM,
            Project     : Project,
            Class       : Class
        } );
    } else {
        this.socket.emit( "updateUser", {
            ID          : ID,
            name        : name.value,
            firstName   : fName.value,
            mail        : mail.value,
            VM          : VM,
            Project     : Project,
            Class       : Class
        } );
    }

}

function deleteUser( userID ) {

    try {

        this.socket.emit( "deleteUser", { ID: userID } );

        // Remove the row from the table
        this.tableUser.row( ( idx, rowdata, node ) => rowdata.ID === parseInt( userID ) ).remove( ).draw( );

    } catch ( error ) {

        console.error( error );

    }

}

function editClassModalSave( ) {


    const editClassModal =


    document.getElementById( "editClassModal" ).classList.remove( "show" );



}

function deleteClass( classID ) {



}