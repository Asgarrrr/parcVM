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
        if (activeIndex > 3) {
            topPosition += shortcuts.clientHeight;
        }
        active_tab.style.top = `${topPosition}px`;
    }

    function changeLink() {
        sidebar_links.forEach((sideLink) => sideLink.classList.remove("active"));
        this.classList.add("active");
        activeIndex = this.dataset.active;
        moveActiveTab();
    }
    sidebar_links.forEach((link) => link.addEventListener("click", changeLink));

    function showTooltip() {
        let tooltip = this.parentNode.lastElementChild;
        let spans = tooltip.children;
        let tooltipIndex = this.dataset.tooltip;
        Array.from(spans).forEach((sp) => sp.classList.remove("show"));
        spans[tooltipIndex].classList.add("show");
        tooltip.style.top = `${(100 / (spans.length * 2)) * (tooltipIndex * 2 + 1)}%`;
    }
    tooltip_elements.forEach((elem) => {
        elem.addEventListener("mouseover", showTooltip);
    });

    try {

        redrawArea.innerHTML = await fetch( "./dashboard" ).then( res => res.text( ) );

    } catch (error) {

    }

    document.getElementById( "dashboard" ).addEventListener( "click", async ( ) => {

        if ( activeArea == 0 )
            return;

        activeArea = 0;

        redrawArea.innerHTML = `<div class="h-100 d-flex justify-content-center align-items-center"><div class="spinner-grow text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

        const response = await fetch( "./dashboard" ).then( response => response.text() );
        redrawArea.innerHTML = response;


    } );

    document.getElementById( "machines" ).addEventListener( "click", async () => {

        if ( activeArea == 1 )
            return;

        activeArea = 1;

        redrawArea.innerHTML = `<div class="h-100 d-flex justify-content-center align-items-center"><div class="spinner-grow text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

        const response = await fetch( "./vm" ).then( response => response.text() );
        redrawArea.innerHTML = response;

    } );

    document.getElementById( "projet" ).addEventListener( "click", async () => {

        if ( activeArea == 2 )
            return;

        activeArea = 2;

        redrawArea.innerHTML = `<div class="h-100 d-flex justify-content-center align-items-center"><div class="spinner-grow text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

        const response = await fetch( "./project" ).then( response => response.text() );
        redrawArea.innerHTML = response;

        this.socket.emit( "loadProjets" );

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

            if ( data.project && data.project.users.find( u => u.IdUser == user.id ) )
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

    })

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