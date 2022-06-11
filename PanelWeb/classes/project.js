module.exports = class Project {

    constructor( bdd ){

      this.bdd = bdd;

    }

    async GetAllProject() {

        const [ rows ] = await this.bdd.execute( `
            SELECT *
            FROM Projet p
            LEFT JOIN UserProject u ON u.IDProject = p.IdProjet
            LEFT JOIN VMProject v ON p.IdProjet = v.IDProject;
        ` );

        const projects = { };

        for( let i = 0; i < rows.length; i++ ){

            const row = rows[ i ];
            const id = row.IdProjet;

            if( !projects[ id ] ){

                projects[ id ] = {

                    id: id,
                    name: row.Nom,
                    description: row.Description,
                    users: [ ],
                    vms: [ ]

                };

            }

            if ( row.IDUser )
                projects[ id ].users.push( row.IDUser );

            if ( row.IDVM )
                projects[ id ].vms.push( row.IDVM );

            projects[ id ].users = [ ...new Set( projects[ id ].users ) ];
            projects[ id ].vms = [ ...new Set( projects[ id ].vms ) ];

        }

        return Object.values( projects );

    }

    async GetProject( id ) {

        const [ rows, fields ] = await this.bdd.execute( `
                SELECT p.*, usr.Nom AS usrNom, usr.Prenom AS usrPrenom, usr.IdUser, v.IDVM
                FROM Projet p
                LEFT JOIN UserProject u ON u.IDProject = p.IdProjet
                LEFT JOIN VMProject v ON p.IdProjet = v.IDProject
                LEFT JOIN users usr ON u.IDUser = usr.IdUser
                WHERE p.IdProjet = ?
            `, [ id ]
        );

        if( rows.length == 0 )
            return null;

        // Group users and vms
        const project = {

            id: rows[ 0 ].IdProjet,
            name: rows[ 0 ].Nom,
            description: rows[ 0 ].Description,
            users: [ ],
            vms: [ ]

        };

        for( let i = 0; i < rows.length; i++ ){

            const row = rows[ i ];

            if ( row.IdUser )
                project.users.push( {
                    nom     : row.usrNom,
                    prenom  : row.usrPrenom,
                    id      : row.IdUser
                } );

            if ( row.IDVM )
                project.vms.push( row.IDVM );

        }

        return project;

    }

    async EditProject( { id, name, description, users = [ ], VM = [ ] } ) {

        console.log( id, name, description, users, VM );

        await this.bdd.execute( "UPDATE `Projet` SET Nom = ?, Description = ? WHERE IdProjet = ?", [ name, description, id ] );

        if ( users ) {

            await this.bdd.execute( "DELETE FROM UserProject WHERE IDProject = ?", [ id ] );

            for ( let i = 0; i < users.length; i++ )
                await this.bdd.execute( "INSERT INTO UserProject(IDProject,IDUser) VALUES ( ?, ? )", [ id, users[ i ] ] );

        }

        if ( VM ) {

            await this.bdd.execute( "DELETE FROM VMProject WHERE IDProject = ?", [ id ] );

            for ( let i = 0; i < VM.length; i++ )
                await this.bdd.execute( "INSERT INTO `VMProject` VALUES ( NULL, ?, ? )", [ id, VM[ i ] ] );

        }

    }

    async CreateProject( { name, description, users = [ ], VM = [ ] } ) {

        const [ rows, fields ] = await this.bdd.execute( "INSERT INTO `Projet` VALUES ( NULL, ?, ? )", [ name, description ] );

        const id = rows.insertId;

        if ( users )
            for ( let i = 0; i < users.length; i++ )
                await this.bdd.execute( "INSERT INTO `UserProject` VALUES ( NULL, ?, ? )", [ id, users[ i ] ] );

        if ( VM )
            for ( let i = 0; i < VM.length; i++ )
                await this.bdd.execute( "INSERT INTO `VMProject` VALUES ( NULL, ?, ? )", [ id, VM[ i ] ] );

        return id;

    }

    async DeleteProject( id ) {

        await this.bdd.execute( "DELETE FROM Projet WHERE IdProjet = ?", [ id ] );
        await this.bdd.execute( "DELETE FROM UserProject WHERE IDProject = ?", [ id ] );
        await this.bdd.execute( "DELETE FROM VMProject WHERE IDProject = ?", [ id ] );

    }

}
