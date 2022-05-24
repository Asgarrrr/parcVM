( async( ) => {

    console.log(
        "%cSalut ! Systéme crée par Lucas Ghyselen & Jérémy Caruelle",
        "background-image: url( 'http://orig11.deviantart.net/dcab/f/2011/158/1/6/nyan_cat_by_valcreon-d3iapfh.gif' ); background-repeat: no-repeat; background-size: cover; padding: 0px 0px 200px 0px; background-position: center center;",
    );

    console.log( "https://github.com/Asgarrrr", "https://github.com/LucasGLaPro" );

    // Create a new websocket connection
    this.socket = io( "192.168.64.103", {
        transports: [ "websocket" ],
    } );

    const VMtable = new DataTable( "#table_id", {
        columns: [
            { data: "ID"        },
            { data: "name"      },
            { data: "status"    },
            { data: "CPU"       },
            { data: "RAM"       },
            { data: "HDD"       },
            { data: "Start"     },
            { data: "Stop"      },
            { data: "Restart"   },
            { data: "Delete"    },
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
    });

    this.socket.emit( "loadVM" );
    refreshRequest = setInterval( ( ) => this.socket.emit( "loadVM" ), 1000 );

    this.socket.on( "loadVM", ( data ) => {

        try {

            for( const VM of data.VMS ) {

                console.log( VM );

                const matchdata = VMtable.rows( function ( idx, rowdata, node ) {
                    return rowdata.ID === VM.vmid;
                }).data();

                // Check if the VM is already in the table
                if( matchdata.length === 0 ) {

                    // Add the VM to the table
                    VMtable.row.add( {
                        ID: VM.vmid,
                        name: VM.name,
                        status: `<span class="badge text-bg-${ VM.status === "running" ? "success" : "danger" }">${ VM.status }</span>`,
                        CPU     : Math.round( VM.cpu * 100 ) / 100 + " %",
                        RAM     : Math.round( ( VM.mem / VM.maxmem ) * 100 ) + " %",
                        HDD     : Math.round( ( VM.disk / VM.maxdisk ) * 100 || 0 ) + "%",
                        Start   : `<button class="btn btn-success" onclick="startVM( ${VM.vmid} )">Start</button>`,
                        Stop    : `<button class="btn btn-danger" onclick="stopVM( ${VM.vmid} )">Stop</button>`,
                        Restart : `<button class="btn btn-warning" onclick="restartVM( ${VM.vmid} )">Restart</button>`,
                        Delete  : `<button class="btn btn-danger" onclick="deleteVM( ${VM.vmid} )">Delete</button>`,

                    } ).draw( false );

                } else {

                    // Update the VM in the table
                    VMtable.row( function ( idx, rowdata, node ) {
                        return rowdata.ID === VM.vmid;
                    }).data( {
                        ID: VM.vmid,
                        name: VM.name,
                        status: `<span class="badge text-bg-${ VM.status === "running" ? "success" : "danger" }">${ VM.status }</span>`,
                        CPU     : Math.round( VM.cpu * 100 ) / 100 + "%",
                        RAM     : Math.round( ( VM.mem / VM.maxmem ) * 100 ) + "%",
                        HDD     : Math.round( ( VM.disk / VM.maxdisk ) * 100 || 0 ) + "%",
                        Start   : `<button class="btn btn-success" onclick="startVM( ${VM.vmid} )">Start</button>`,
                        Stop    : `<button class="btn btn-danger" onclick="stopVM( ${VM.vmid} )">Stop</button>`,
                        Restart : `<button class="btn btn-warning" onclick="restartVM( ${VM.vmid} )">Restart</button>`,
                        Delete  : `<button class="btn btn-danger" onclick="deleteVM( ${VM.vmid} )">Delete</button>`,
                    } ).draw( false );

                }

            }

        } catch ( error ) {
            console.log( error );
        }

    } );

    this.socket.on( "deleteVM", ( data ) => {

        try {

            VMtable.rows( function ( idx, rowdata, node ) {
                return rowdata.ID === data;
            }).remove( ).draw( false );

        } catch ( error ) {
            console.log( error );
        }


    } );

} )( );

function startVM( vmid ) {

    this.socket.emit( "startVMRequest", vmid );
}

function stopVM( vmid ) {

    this.socket.emit( "stopVMRequest", vmid );
}

function restartVM( vmid ) {

    this.socket.emit( "restartVMRequest", vmid );
}

function deleteVM( vmid ) {
    this.socket.emit( "deleteVMRequest", vmid );
}





//     document.getElementById( "machines" ).addEventListener( "click", async () => {

//         if ( activeArea == 1 )
//             return;

//         activeArea = 1;

//         redrawArea.innerHTML = `<div class="h-100 d-flex justify-content-center align-items-center"><div class="spinner-grow text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

//         const response = await fetch( "./vm" ).then( response => response.text() );
//         redrawArea.innerHTML = response;

//         this.VMtable = new DataTable( "#table_id", {
//             columns: [
//                 { data: "ID"        },
//                 { data: "name"      },
//                 { data: "status"    },
//                 { data: "IP"        },
//                 { data: "RAM"       },
//                 { data: "CPU"       },
//                 { data: "HDD"       },
//             ],
//             language: {
//                 emptyTable: "Aucune machine disponible",
//                 info: "Affichage de _START_ à _END_ sur _TOTAL_ machines",
//                 infoEmpty: "Affichage de 0 à 0 sur 0 machines",
//                 infoFiltered: "(filtré de _MAX_ machines au total)",
//                 infoPostFix: "",
//                 lengthMenu: "Afficher _MENU_ machines",
//                 loadingRecords: "Chargement...",
//                 processing: "Traitement...",
//                 search: "Rechercher:",
//                 zeroRecords: "Aucune machine correspondante trouvée",
//                 paginate: {
//                     first: "Premier",
//                     last: "Dernier",
//                     next: "Suivant",
//                     previous: "Précédent"
//                 },
//                 aria: {
//                     sortAscending: ": activer pour trier la colonne par ordre croissant",
//                     sortDescending: ": activer pour trier la colonne par ordre décroissant"
//                 }
//             }
//         });

//         this.socket.emit( "loadVM" );
//         refreshRequest = setInterval( ( ) => this.socket.emit( "loadVM" ), 1000 );

//     } );

//     document.getElementById( "projet" ).addEventListener( "click", async () => {

//         if ( activeArea == 2 )
//             return;

//         activeArea = 2;

//         redrawArea.innerHTML = `<div class="h-100 d-flex justify-content-center align-items-center"><div class="spinner-grow text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

//         const response = await fetch( "./project" ).then( response => response.text() );
//         redrawArea.innerHTML = response;

//         this.socket.emit( "loadProjets" );

//     } );

//     let socketConnected = false;

//     this.socket.on( "connect", () => {
//         socketConnected = true;
//         console.log( "Socket connected" );
//     } );

//     this.socket.on( "disconnect", () => {
//         socketConnected = false;
//         console.log( "Socket disconnected" );

//     } );

//     this.socket.on( "error", () => {
//         socketConnected = false;
//         console.log( "Socket error" );
//     } );

//     this.socket.on( "loadProjets", ( data ) => {

//         const projectContainer = document.getElementById( "projectContainer" );

//         // Only if the projectContainer is empty
//         if ( projectContainer.children.length == 0 ) {


//             for( const projet of data ) {

//                 const card = document.createElement( "div" );
//                 card.id = `project-${projet.id}`;
//                 card.classList.add( "card" );
//                 card.classList.add( "m-3" );
//                 const cardBody = document.createElement( "div" );
//                 cardBody.classList.add( "card-body" );
//                 const cardTitle = document.createElement( "h5" );
//                 cardTitle.classList.add( "card-title" );
//                 cardTitle.innerText = projet.name;
//                 const cardText = document.createElement( "p" );
//                 cardText.classList.add( "card-text" );
//                 cardText.innerText = projet.description;
//                 cardBody.appendChild( cardTitle );
//                 cardBody.appendChild( cardText );
//                 const listGroup = document.createElement( "ul" );
//                 listGroup.classList.add( "list-group" );
//                 listGroup.classList.add( "list-group-flush" );

//                 const listGroupEdit = document.createElement( "li" );
//                 const listGroupEditLink = document.createElement( "a" );
//                 listGroupEdit.classList.add( "list-group-item", "list-group-item-action" );
//                 listGroupEditLink.innerText = "Modifier";
//                 listGroupEditLink.classList.add( "text-primary" );
//                 listGroupEdit.appendChild( listGroupEditLink );
//                 listGroupEdit.addEventListener( "click", ( ) => {

//                     this.socket.emit( "getProjectDetail", projet.id );

//                     document.getElementById( "modalProjectName" ).innerHTML = "Modifier le projet";
//                     document.getElementById( "editProjectModalDelete" ).style.display = "block";
//                     const modalDom = document.getElementById( "editProjectModal" );
//                     modalDom.dataset.id = projet.id;
//                     const editModal = new bootstrap.Modal( modalDom, { } )
//                     editModal.show( );

//                 } );
//                 listGroup.appendChild( listGroupEdit );
//                 const listGroupUser = document.createElement( "li" );
//                 listGroupUser.classList.add( "list-group-item", "list-group-item-action", "d-flex", "justify-content-between", "align-items-center" );
//                 listGroupUser.innerText = "Utilisateurs";
//                 listGroup.appendChild( listGroupUser );
//                 const listGroupUserText = document.createElement( "span" );
//                 listGroupUserText.innerText = projet.users.length;
//                 listGroupUser.appendChild( listGroupUserText );
//                 const listGroupMachine = document.createElement( "li" );
//                 listGroupMachine.classList.add( "list-group-item", "list-group-item-action", "d-flex", "justify-content-between", "align-items-center" );
//                 listGroupMachine.innerText = "Machines";
//                 const listGroupMachineText = document.createElement( "span" );
//                 listGroupMachineText.innerText = projet.vms.length;
//                 listGroup.appendChild( listGroupMachine );
//                 listGroupMachine.appendChild( listGroupMachineText );
//                 card.appendChild( cardBody );
//                 card.appendChild( listGroup );
//                 projectContainer.appendChild( card );

//             }

//         }

//     });

//     this.socket.on( "getProjectDetail", ( data ) => {

//         document.getElementById( "editProjectModalName" ).value = data.project?.name ?? "";
//         document.getElementById( "editProjectModalDesc" ).value = data.project?.description ?? "";

//         const selectUser = document.getElementById( "editProjectModalSelectUser" );
//         selectUser.innerHTML = "";

//         const selectVM = document.getElementById( "editProjectModalSelectVM" );
//         selectVM.innerHTML = "";

//         for( const user of data.users ) {

//             const div = document.createElement( "div" );
//             div.classList.add( "form-check" );
//             const input = document.createElement( "input" );
//             input.classList.add( "form-check-input" );
//             input.type = "checkbox";
//             input.id = user.IdUser;
//             input.value = user.IdUser;

//             if ( data.project && data.project.users.find( u => u.IdUser == user.id ) )
//                 input.checked = true;

//             const label = document.createElement( "label" );
//             label.classList.add( "form-check-label" );
//             label.innerText = user.Nom + " " + user.Prenom;
//             div.appendChild( input );
//             div.appendChild( label );
//             selectUser.appendChild( div );

//         }

//         for( const VM of data?.VM ) {

//             const div = document.createElement( "div" );
//             div.classList.add( "form-check" );
//             const input = document.createElement( "input" );
//             input.classList.add( "form-check-input" );
//             input.type = "checkbox";
//             input.value = VM.id;


//             if ( data.project && data.project.vms.find( u => u == VM.id ) )
//                 input.checked = true;

//             const label = document.createElement( "label" );
//             label.classList.add( "form-check-label" );
//             label.innerText = VM.name;
//             div.appendChild( input );
//             div.appendChild( label );
//             selectVM.appendChild( div );

//         }

//     } );

//     this.socket.on( "createProject", ( data ) => {

//         if ( data === "fail" ) {


//         } else {

//             const card = document.createElement( "div" );
//             card.id = `project-${data.id}`;
//             card.classList.add( "card" );
//             card.classList.add( "m-3" );
//             const cardBody = document.createElement( "div" );
//             cardBody.classList.add( "card-body" );
//             const cardTitle = document.createElement( "h5" );
//             cardTitle.classList.add( "card-title" );
//             cardTitle.innerText = data.name;
//             const cardText = document.createElement( "p" );
//             cardText.classList.add( "card-text" );
//             cardText.innerText = data.description;
//             cardBody.appendChild( cardTitle );
//             cardBody.appendChild( cardText );
//             const listGroup = document.createElement( "ul" );
//             listGroup.classList.add( "list-group" );
//             listGroup.classList.add( "list-group-flush" );

//             const listGroupEdit = document.createElement( "li" );
//             const listGroupEditLink = document.createElement( "a" );
//             listGroupEdit.classList.add( "list-group-item", "list-group-item-action" );
//             listGroupEditLink.innerText = "Modifier";
//             listGroupEditLink.classList.add( "text-primary" );
//             listGroupEdit.appendChild( listGroupEditLink );
//             listGroupEdit.addEventListener( "click", ( ) => {

//                 this.socket.emit( "getProjectDetail", projet.id );

//                 document.getElementById( "modalProjectName" ).innerHTML = "Modifier le projet";
//                 const modalDom = document.getElementById( "editProjectModal" );
//                 modalDom.dataset.id = data.id;
//                 const editModal = new bootstrap.Modal( modalDom, { } )
//                 editModal.show( );

//             } );
//             listGroup.appendChild( listGroupEdit );
//             const listGroupUser = document.createElement( "li" );
//             listGroupUser.classList.add( "list-group-item", "list-group-item-action", "d-flex", "justify-content-between", "align-items-center" );
//             listGroupUser.innerText = "Utilisateurs";
//             listGroup.appendChild( listGroupUser );
//             const listGroupUserText = document.createElement( "span" );
//             listGroupUserText.innerText = data.users.length;
//             listGroupUser.appendChild( listGroupUserText );
//             const listGroupMachine = document.createElement( "li" );
//             listGroupMachine.classList.add( "list-group-item", "list-group-item-action", "d-flex", "justify-content-between", "align-items-center" );
//             listGroupMachine.innerText = "Machines";
//             const listGroupMachineText = document.createElement( "span" );
//             listGroupMachineText.innerText = data.VM.length;
//             listGroup.appendChild( listGroupMachine );
//             listGroupMachine.appendChild( listGroupMachineText );
//             card.appendChild( cardBody );
//             card.appendChild( listGroup );
//             projectContainer.appendChild( card );

//         }

//     } );

//     this.socket.on( "deleteProject", ( data ) => {

//         if ( data === "fail" ) {

//         } else {

//             const card = document.getElementById( `project-${data}` );
//             card.remove();

//         }

//     } );

//     this.socket.on( "loadVM", ( data ) => {

//         try {

//             for( const VM of data.VMS ) {

//                 const matchdata = this.VMtable.rows( function ( idx, rowdata, node ) {
//                     return rowdata.ID === VM.vmid;
//                 }).data();
//                 console.log( matchdata );

//                 if ( !matchdata.length ) {

//                     this.VMtable.row.add( {
//                         ID      : VM.vmid,
//                         name    : VM.name,
//                         status  : VM.status,
//                         IP      : "111.111.111.111",
//                         CPU     : ~~( VM.cpu / 1000 ),
//                         RAM     : ~~( VM.mem / VM.maxmem ) * 100,
//                         HDD     : ~~( VM.disk / VM.maxdisk ) * 100,

//                     });

//                 } else {

//                     // Change ip to random
//                     this.VMtable.row( matchdata[ 0 ] ).data( {
//                         ID      : VM.vmid,
//                         name    : VM.name,
//                         status  : VM.status,
//                         IP      : `${Math.floor( Math.random( ) * 255 )}.${Math.floor( Math.random( ) * 255 )}.${Math.floor( Math.random( ) * 255 )}.${Math.floor( Math.random( ) * 255 )}`,
//                         CPU     : ~~( VM.cpu / 1000 ),
//                         RAM     : ~~( VM.mem / VM.maxmem ) * 100,
//                         HDD     : ~~( VM.disk / VM.maxdisk ) * 100,
//                     } ).draw( false );

//                 }

//             }

//             this.VMtable.draw( );
//             // if ( !data.VMS.length )
//             //     return;

//             // this.VMtable.rows( ).every( function ( ) {
//             //     var data = this.data( );
//             //     console.log( ( data.VMS.find( VM => VM.vmid == data.id ) ))

//             // } );

//             // for( const VM of data?.VMS ) {

//             //     this.VMtable.row.add( {
//             //         ID      : VM.vmid,
//             //         name    : VM.name,
//             //         status  : VM.status,
//             //         IP      : "111.111.111.111",
//             //         CPU     : ~~( VM.cpu / 1000 ),
//             //         RAM     : ~~( VM.mem / VM.maxmem ) * 100,
//             //         HDD     : ~~( VM.disk / VM.maxdisk ) * 100,
//             // });

//             // }

//             // this.VMtable.draw( );

//         } catch ( error ) {
//             console.log( error );
//         }

//     } );

// } )( );


// function createPopup( text ) {

//     const toast = document.createElement( "div" );
//     toast.classList.add( "toast", "align-items-center", "text-white", "bg-danger" );
//     toast.setAttribute( "role", "alert" );
//     toast.setAttribute( "aria-live", "assertive" );
//     toast.setAttribute( "aria-atomic", "true" );

//     const toastFlex = document.createElement( "div" );
//     toastFlex.classList.add( "d-flex" );

//     const toastBody = document.createElement( "div" );
//     toastBody.classList.add( "toast-body" );

//     toastBody.innerHTML = text;

//     toastFlex.appendChild( toastBody );
//     toast.appendChild( toastFlex );

//     document.getElementById( "popup" ).appendChild( toast );

//     const bootstrapToast = bootstrap.Toast.getOrCreateInstance( toast );

//     bootstrapToast.show();

// }


// function editProjectModalSearchUser( filter ) {

//     const selectUser = document.getElementById( "editProjectModalSelectUser" );

//     for (const select of selectUser.getElementsByTagName( "label" ) ) {

//         selectValue = select.textContent || select.innerText;

//         select.parentNode.style.display = selectValue.toLowerCase().indexOf( filter.toLowerCase() ) > -1 ? "" : "none";

//     }

// }

// function editProjectModalSearchVM( filter ) {

//     const selectUser = document.getElementById( "editProjectModalSelectVM" );

//     for (const select of selectUser.getElementsByTagName( "label" ) ) {

//         selectValue = select.textContent || select.innerText;

//         select.parentNode.style.display = selectValue.toLowerCase().indexOf( filter.toLowerCase() ) > -1 ? "" : "none";

//     }

// }

// function editProjectModalSave( ) {

//     const id    = document.getElementById( "editProjectModal" ).dataset.id;
//     const name  = document.getElementById( "editProjectModalName" ).value;
//     const desc  = document.getElementById( "editProjectModalDesc" ).value;
//     const users = [];
//     const VM    = [];

//     for ( const select of document.getElementById( "editProjectModalSelectUser" ).getElementsByTagName( "input" ) ) {

//         if ( select.checked )
//             users.push( select.value );

//     }

//     for ( const select of document.getElementById( "editProjectModalSelectVM" ).getElementsByTagName( "input" ) ) {

//         if ( select.checked )
//             VM.push( select.value );

//     }

//     if ( id === "newProject" ) {

//         this.socket.emit( "createProject", { id: id, name: name, description: desc, users: users, VM: VM } );

//     } else {

//         this.socket.emit( "editProject", { id: id, name: name, description: desc, users: users, VM: VM } );

//         const projectCard = document.getElementById( "project-" + id );
//         projectCard.querySelector( ".card-title" ).innerText = name;
//         projectCard.querySelector( ".card-text" ).innerText = desc;
//         projectCard.querySelectorAll( "span" )[ 0 ].innerText = users.length;
//         projectCard.querySelectorAll( "span" )[ 1 ].innerText = VM.length;

//     }

// }

// function createProject( ) {

//     document.getElementById( "editProjectModalDelete" ).style.display = "none";

//     this.socket.emit( "getProjectDetail", 0 );

//     document.getElementById( "editProjectModalName" ).value = "";
//     document.getElementById( "editProjectModalDesc" ).value = "";
//     document.getElementById( "modalProjectName" ).innerHTML = "Créer un projet";

//     for ( const select of document.getElementById( "editProjectModalSelectUser" ).getElementsByTagName( "input" ) )
//         select.checked = false;

//     for ( const select of document.getElementById( "editProjectModalSelectVM" ).getElementsByTagName( "input" ) )
//         select.checked = false;

//     const modalDom = document.getElementById( "editProjectModal" );
//     modalDom.dataset.id = "newProject";
//     const editModal = new bootstrap.Modal( modalDom, { } )
//     editModal.show( );

// }

// function removeProject( ) {

//     const id = document.getElementById( "editProjectModal" ).dataset.id;

//     this.socket.emit( "deleteProject", id );

// }
