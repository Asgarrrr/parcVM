module.exports = class User {

    constructor( bdd ){

      this.bdd = bdd;

    }

    async GetAllUser() {

        const [ rows, fields ] = await this.bdd.execute( "SELECT * FROM users" );
        return rows;

    }


    async CreateUser( Nom, Prenom, Email, MDP, admin = 0 ) {

        const [ rows, fields ] = await this.bdd.execute( "INSERT INTO `users` VALUES ( NULL, ?, ?, ?, ?, ? )", [ Nom, Prenom, Email, MDP, admin ] );
        return rows;

    }

    async DeleteUser( id ) {

        const [ rows, fields ] = await this.bdd.execute( "DELETE FROM users WHERE IdUser = ?", [ id ] );
        return rows;

    }

    async GetUserbyId( id ) {

        const [ rows, fields ] = await this.bdd.execute( "SELECT * FROM users WHERE IdUser = ?", [ id ] );
        return rows;

    }

    async EditUser( id, Nom, Prenom, Email, MDP, admin ) {

        const [ rows, fields ] = await this.bdd.execute( "UPDATE `users` SET Nom = ?, Prenom = ?, Email = ?, MDP = SHA2( ?, 512 ), admin = ? WHERE IdUser = ?", [ Nom, Prenom, Email, MDP, admin, id ] );
        return rows;

    }

    async FindSession( Token ) {

        const [ rows, fields ] = await this.bdd.execute( "SELECT users.IdUser, users.Nom, users.Email, users.Prenom, users.admin FROM users, Sessions WHERE Sessions.Token = ? AND Sessions.UserID = users.IdUser;", [ Token ] );
        return rows;

    }


    async CreateSession( iduser, token ) {

        const [ rows, fields ] = await this.bdd.execute( "INSERT INTO `Sessions` VALUES ( NULL, '"+iduser+"', '"+token+"')" );
        return rows;

    }

    async DeleteSession( token ) {

        const [ rows, fields ] = await this.bdd.execute( "DELETE FROM Sessions WHERE Token = ?", [ token ] );
        return rows;

    }

    async ConnectUser( email, mdp ){

        const [ rows, fields ] = await this.bdd.execute( "SELECT Email, IdUser, Nom, Prenom, admin FROM `users` WHERE Email = ? AND SHA2( ?, 512 ) LIMIT 1;", [ email, mdp ] );
        return rows;

    }


}