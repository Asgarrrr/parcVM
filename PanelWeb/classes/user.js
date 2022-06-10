var nodemailer = require('nodemailer');
module.exports = class User {

    constructor( bdd ){

      this.bdd = bdd;

    }

    async GetAllUser() {

        const [ rows ] = await this.bdd.execute( "SELECT Nom, Prenom, IdUser FROM users" );
        return rows;

    }

    async CreateUser( Nom, Prenom, Email, MDP, admin = 0, Projets = [], Classes = [], Machines = [] ) {

        const [ rows ] = await this.bdd.execute( "INSERT INTO `users` VALUES ( NULL, ?, ?, ?, SHA2( ?, 512 ), ? )", [ Nom, Prenom, Email, MDP, admin ] );

        for ( var i = 0; i < Projets.length; i++ )
            this.bdd.execute( "INSERT INTO `UserProject` VALUES ( NULL, ?, ? )", [ rows.insertId, Projets[ i ] ] );

        for ( var i = 0; i < Classes.length; i++ )
            this.bdd.execute( "INSERT INTO `UserClass` VALUES ( NULL, ?, ? )", [ rows.insertId, Classes[ i ] ] );

        for ( var i = 0; i < Machines.length; i++ )
            this.bdd.execute( "INSERT INTO `UserVM` VALUES ( NULL, ?, ? )", [ rows.insertId, Machines[ i ] ] );

        try {

            const transporter = nodemailer.createTransport({
                host: "debugmail.io",
                port: 25,
                auth: {
                    user: "02bc9cfc-d232-4401-aaf3-851172838010",
                    pass: "d3f5ec17-4d9d-4162-aeef-1818a834553b"
                }
            });

            transporter.sendMail({
                from    : "admin@abyss.com",
                to      : Email,
                subject : 'Mot de passe Abyss',
                text    : "Bonjour,\n\nVotre mot de passe est : " + MDP + "\n\nCordialement,\n\nL'équipe Abyss"
            }, ( error, info ) => {

                if ( error )
                    return console.log( error );

            });

        } catch ( error ) {

            console.log( error )

        }

        return rows;

    }

    async DeleteUser( id ) {

        await this.bdd.execute( "DELETE FROM users WHERE IdUser = ?", [ id ] );
        await this.bdd.execute( "DELETE FROM UserProject WHERE IdUser = ?", [ id ] );
        await this.bdd.execute( "DELETE FROM UserClass WHERE IdUser = ?", [ id ] );
        await this.bdd.execute( "DELETE FROM UserVM WHERE IdUser = ?", [ id ] );

    }

    async GetUserbyId( id ) {

        const [ rows ] = await this.bdd.execute(`
            SELECT users.Nom, users.Prenom, users.Email, users.admin, users.IdUser, Projet.Nom as PName, Classe.Nom AS CName, IDClasse, UserVM.IdVm FROM users
            LEFT JOIN UserProject ON users.IdUser = UserProject.IDUser
            LEFT JOIN Projet ON Projet.IdProjet = UserProject.IDProject
            LEFT JOIN UserClass ON users.IdUser = UserClass.IDUser
            LEFT JOIN Classe ON Classe.IDClasse = UserClass.IDClass
            LEFT JOIN UserVM ON UserVM.IDUser = users.IdUser
            WHERE users.IdUser = ?`, [ id ] );

        var users = {};

        rows.forEach(function(row) {
            if(!users[row.IdUser]) {
                users[row.IdUser] = {
                    IdUser  : row.IdUser,
                    UNom    : row.Nom,
                    UPrenom : row.Prenom,
                    Email   : row.Email,
                    admin   : row.admin,
                    Projets : [],
                    Classes : [],
                    VM      : []
                };
            }

            if ( row.PName && users[row.IdUser].Projets.indexOf( row.PName ) == -1 )
                users[ row.IdUser ].Projets.push( row.PName );

            if ( row.CName && users[ row.IdUser ].Classes.indexOf( row.CName ) == -1 )
                users[ row.IdUser ].Classes.push( row.CName );

            if ( row.IdVm && users[ row.IdUser ].VM.indexOf( row.IdVm ) == -1 )
                users[ row.IdUser ].VM.push( row.IdVm );

        });

        return users;

    }

    async EditUser( id, Nom, Prenom, Email, MDP, Project, Class, VM ) {

        if ( MDP )
            await this.bdd.execute( "UPDATE `users` SET Nom = ?, Prenom = ?, Email = ?, MDP = SHA2( ?, 512 ), admin = ? WHERE IdUser = ?", [ Nom, Prenom, Email, MDP, admin, id ] );
        else
            await this.bdd.execute( "UPDATE `users` SET Nom = ?, Prenom = ?, Email = ? WHERE IdUser = ?", [ Nom, Prenom, Email, id ] );

        await this.bdd.execute( "DELETE FROM UserProject WHERE IdUser = ?", [ id ] );
        await this.bdd.execute( "DELETE FROM UserClass WHERE IdUser = ?", [ id ] );
        await this.bdd.execute( "DELETE FROM UserVM WHERE IdUser = ?", [ id ] );

        for ( var i = 0; i < Project.length; i++ )
            await this.bdd.execute( "INSERT INTO `UserProject` VALUES ( NULL, ?, ? )", [ id, Project[ i ] ] );

        for ( var i = 0; i < Class.length; i++ )
            await this.bdd.execute( "INSERT INTO `UserClass` VALUES ( NULL, ?, ? )", [ id, Class[ i ] ] );

        for ( var i = 0; i < VM.length; i++ )
            await this.bdd.execute( "INSERT INTO `UserVM` VALUES ( NULL, ?, ? )", [ id, VM[ i ] ] );

    }

    async FindSession( Token ) {

        const [ rows ] = await this.bdd.execute( "SELECT users.IdUser, users.Nom, users.Email, users.Prenom, users.admin FROM users, Sessions WHERE Sessions.Token = ? AND Sessions.UserID = users.IdUser;", [ Token ] );
        return rows;

    }


    async CreateSession( iduser, token ) {

        const [ rows ] = await this.bdd.execute( "INSERT INTO `Sessions` VALUES ( NULL, '"+iduser+"', '"+token+"')" );
        return rows;

    }

    async DeleteSession( token ) {

        const [ rows ] = await this.bdd.execute( "DELETE FROM Sessions WHERE Token = ?", [ token ] );
        return rows;

    }

    async ConnectUser( email, mdp ){

        const [ rows ] = await this.bdd.execute( "SELECT Email, IdUser, Nom, Prenom, admin FROM `users` WHERE Email = ? AND MDP = SHA2( ?, 512 ) LIMIT 1;", [ email, mdp ] );
        return rows;

    }

    async GetAllUserDetails( ) {

        const [ rows ] = await this.bdd.execute(
            `
            SELECT users.Nom, users.Prenom, users.Email, users.admin, users.IdUser, Projet.Nom as PName, Classe.Nom AS CName, IDClasse, UserVM.IdVm FROM users
            LEFT JOIN UserProject ON users.IdUser = UserProject.IDUser
            LEFT JOIN Projet ON Projet.IdProjet = UserProject.IDProject
            LEFT JOIN UserClass ON users.IdUser = UserClass.IDUser
            LEFT JOIN Classe ON Classe.IDClasse = UserClass.IDClass
            LEFT JOIN UserVM ON UserVM.IDUser = users.IdUser` );

        var users = {};

        rows.forEach(function(row) {
            if(!users[row.IdUser]) {
                users[row.IdUser] = {
                    IdUser  : row.IdUser,
                    UNom    : row.Nom,
                    UPrenom : row.Prenom,
                    Email   : row.Email,
                    admin   : row.admin,
                    Projets : [],
                    Classes : [],
                    VM      : []
                };
            }

            if ( row.PName && users[row.IdUser].Projets.indexOf( row.PName ) == -1 )
                users[ row.IdUser ].Projets.push( row.PName );

            if ( row.CName && users[ row.IdUser ].Classes.indexOf( row.CName ) == -1 )
                users[ row.IdUser ].Classes.push( row.CName );

            if ( row.IdVm && users[ row.IdUser ].VM.indexOf( row.IdVm ) == -1 )
                users[ row.IdUser ].VM.push( row.IdVm );

        });

        return users;

    }

}
