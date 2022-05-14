module.exports = class Project {

    constructor( bdd ){

      this.bdd = bdd;

    }

    async GetAllProject() {

        const [ rows, fields ] = await this.bdd.execute( `
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

        }

        return Object.values( projects );

    }

    async GetProject( id ) {

        const [ rows, fields ] = await this.bdd.execute( `
            SELECT p.*, usr.Nom, usr.Prenom
                FROM Projet p
                LEFT JOIN UserProject u ON u.IDProject = p.IdProjet
                LEFT JOIN VMProject v ON p.IdProjet = v.IDProject
                LEFT JOIN users usr ON u.IDUser = usr.IdUser
                LEFT JOIN Vm vm ON v.IDVM = vm.IdVm
                WHERE p.IdProjet = ?
            `, [ id ] );
        return rows[ 0 ];

    }

    async GetProjectVMs( id ) {

        const [ rows, fields ] = await this.bdd.execute( "SELECT * FROM VMProject WHERE IdProjet = ?", [ id ] );
        return rows;

    }

    async GetProjectMember( id ) {

        const [ rows, fields ] = await this.bdd.execute( "SELECT * FROM UserProject WHERE IdProjet = ?", [ id ] );
        return rows;

    }




}