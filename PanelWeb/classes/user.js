var nodemailer = require('nodemailer');
module.exports = class User {

    constructor( bdd ){

      this.bdd = bdd;

    }

    async GetAllUser() {

        const [ rows ] = await this.bdd.execute( "SELECT * FROM users" );
        return rows;

    }


    async CreateUser( Nom, Prenom, Email, MDP, admin = 0 ) {

        const [ rows ] = await this.bdd.execute( "INSERT INTO `users` VALUES ( NULL, ?, ?, ?, ?, ? )", [ Nom, Prenom, Email, MDP, admin ] );

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'coriolistestrecrutement@gmail.com',
            pass: 'nop'
            }
        });

        var mailOptions = {
            from: 'coriolistestrecrutement@gmail.com',
            to: Email,
            subject: 'Mot de passe Abyss',
            text: "Bonjour, votre mot de passe est: '" + MDP + "' vous pouvez le modifier dans l'interface."
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            }
        });

        return rows;

    }

    async DeleteUser( id ) {

        const [ rows ] = await this.bdd.execute( "DELETE FROM users WHERE IdUser = ?", [ id ] );
        return rows;

    }

    async GetUserbyId( id ) {

        const [ rows ] = await this.bdd.execute( "SELECT * FROM users WHERE IdUser = ?", [ id ] );
        return rows;

    }

    async EditUser( id, Nom, Prenom, Email, MDP, admin ) {

        const [ rows ] = await this.bdd.execute( "UPDATE `users` SET Nom = ?, Prenom = ?, Email = ?, MDP = SHA2( ?, 512 ), admin = ? WHERE IdUser = ?", [ Nom, Prenom, Email, MDP, admin, id ] );
        return rows;

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

        const [ rows ] = await this.bdd.execute( "SELECT Email, IdUser, Nom, Prenom, admin FROM `users` WHERE Email = ? AND SHA2( ?, 512 ) LIMIT 1;", [ email, mdp ] );
        return rows;

    }

    async GetAllUserDetails( ) {

        const [ rows ] = await this.bdd.execute(
            `SELECT users.Nom, users.Prenom, users.Email, users.admin, users.IdUser, Projet.Nom as PName FROM users
             LEFT JOIN UserProject ON users.IdUser = UserProject.IDUser
             LEFT JOIN Projet ON Projet.IdProjet = UserProject.IDProject` );

        var users = {};

        rows.forEach(function(row) {
            if(!users[row.IdUser]) {
                users[row.IdUser] = {
                    IdUser  : row.IdUser,
                    UNom    : row.Nom,
                    UPrenom : row.Prenom,
                    Email   : row.Email,
                    admin   : row.admin,
                    Projets : []
                };
            }
            users[ row.IdUser ].Projets.push( row.PName );
        });

        return users;

    }

}
