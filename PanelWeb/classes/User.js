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


    CreateUser(Nom, Prenom, Email, MDP) {

      return new Promise( ( resolve, reject ) => {
        this.bdd.query( "INSERT INTO `users` VALUES ( NULL, '"+Nom+"', '"+Prenom+"', '"+Email+"', '"+MDP+"')", function ( err, result ) {
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


}

module.exports = User
