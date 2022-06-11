module.exports = class Class {

    constructor( bdd ){

        this.bdd = bdd;

    }

    async GetAllClass() {

        const [ rows ] = await this.bdd.execute( `
            SELECT *, c.Nom as CName
            FROM Classe c
            LEFT JOIN UserClass uc ON uc.IDClass = c.IDClasse
            LEFT JOIN users u ON u.IDUser = uc.IDUser;` );

        // Group by class id
        const classes = {};
        for( let i = 0; i < rows.length; i++ ){

            const row = rows[ i ];
            const id = row.IDClasse;

            if( !classes[ id ] ){

                classes[ id ] = {
                    id: id,
                    name: row.CName,
                    users: []
                };

            }

            row.Nom && classes[ id ].users.push( {
                id          : row.IDUser,
                name        : row.Nom,
                firstname   : row.Prenom,
                email       : row.Email
            } );

        }

        return classes;

    }

    async GetClass( id ) {

        const [ rows, fields ] = await this.bdd.execute( `SELECT * FROM Classe WHERE IdClasse = ?`, [ id ] );
        return rows[ 0 ];

    }

    async getClassesDetails( id ) {

        const [ rows, fields ] = await this.bdd.execute( `SELECT users.IdUser, users.Nom, users.Prenom, users.Email, Classe.IdClasse, Classe.Nom AS ClasseNom, Classe.Description FROM Classe, users, UserClass WHERE users.IdUser = UserClass.idUser and Classe.IdClasse = UserClass.idClass and Classe.IdClasse = ?`, [ id ] );

    }

    async CreateClass( name, description, users = [ ] ) {

        const [ rows, fields ] = await this.bdd.execute( `INSERT INTO Classe ( Nom, Description ) VALUES ( ?, ? )`, [ name, description ] );

        const id = rows.insertId;

        for( let i = 0; i < users.length; i++ )
            await this.bdd.execute( `INSERT INTO UserClass ( idUser, idClass ) VALUES ( ?, ? )`, [ users[ i ], id ] );

        return id;

    }

    async DeleteClass( id ) {

        await this.bdd.execute( `DELETE FROM Classe WHERE IdClasse = ?`, [ id ] );
        await this.bdd.execute( `DELETE FROM UserClass WHERE idClass = ?`, [ id ] );

    }

    async getClassMembers( idClass ) {

        const [ rows, fields ] = await this.bdd.execute( `SELECT users.IdUser, users.Nom, users.Prenom, users.Email FROM Classe, users, UserClass WHERE users.IdUser = UserClass.idUser and Classe.IdClasse = UserClass.idClass and Classe.IdClasse = ?`, [ idClass ] );

        return rows;

    }

}
