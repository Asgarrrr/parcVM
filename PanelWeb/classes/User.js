const mysql = require('mysql');

class User {

    constructor( bdd ){

      this.bdd = bdd;

    }

    GetAllUser() {

      return new Promise( ( resolve, reject ) => {
        this.bdd.query( "SELECT * FROM users", function ( err, result ) {
          if ( err ) reject( err )
          resolve( result );
        })
      })
    
    }


    CreateUser(Nom, Prenom, Email, MDP, admin) {

      return new Promise( ( resolve, reject ) => {
        this.bdd.query( "INSERT INTO `users` VALUES ( NULL, '"+Nom+"', '"+Prenom+"', '"+Email+"', MD5('"+MDP+"'), '"+admin+"')", function ( err, result ) {
          if ( err ) reject( err )
          resolve( result );
        })
      })
    
    }

    DeleteUser(id) {

      return new Promise( ( resolve, reject ) => {
        this.bdd.query( "DELETE FROM users WHERE IdUser = '"+id+"'", function ( err, result ) {
          if ( err ) reject( err )
          resolve( result );
        })
      })
    
    }

    GetUserbyId(id) {

      return new Promise( ( resolve, reject ) => {
        this.bdd.query( "SELECT * FROM users WHERE IdUser = '"+id+"' ", function ( err, result ) {
          if ( err ) reject( err )
          resolve( result );
        })
      })
    
    }

    EditUser(id, Nom, Prenom, Email, MDP) {

      return new Promise( ( resolve, reject ) => {
        this.bdd.query( "UPDATE users SET Nom = '"+Nom+"', Prenom = '"+Prenom+"', Email = '"+Email+"', MDP = '"+MDP+"' WHERE IdUser = '"+id+"'", function ( err, result ) {
          if ( err ) reject( err )
          resolve( result );
        })
      })
    
    }

    FindSession(Token) {

      return new Promise( ( resolve, reject ) => {
        this.bdd.query( "SELECT users.IdUser, users.Nom, users.Email, users.Prenom FROM users, Sessions WHERE Sessions.Token = '"+Token+"' AND Sessions.UserID = users.IdUser;", function ( err, result ) {
          if ( err ) reject( err )
          resolve( result );
        })
      })

    }


    CreateSession(iduser, token) {

      return new Promise( ( resolve, reject ) => {
        this.bdd.query( "INSERT INTO `Sessions` VALUES ( NULL, '"+iduser+"', '"+token+"')", function ( err, result ) {
          if ( err ) reject( err )
          resolve( result );
        })
      })
    
    }

    ConnectUser(email, mdp){
      
      return new Promise( ( resolve, reject ) => {

        this.bdd.query( "SELECT Email, IdUser, Nom, Prenom, admin FROM `users` WHERE Email = '"+email+"' AND  MD5('"+mdp+"') LIMIT 1;", function ( err, result ) {
          if ( err ) reject( err )
          resolve( result )
        })
      });

    }


}

module.exports = User


//SELECT MDP FROM `users` WHERE MD5("test");