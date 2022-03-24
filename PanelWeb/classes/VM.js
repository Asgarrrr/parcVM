const mysql = require('mysql');

class VM {

    constructor( bdd ){

      this.bdd = bdd;

    }



    inservm(idvm) {

      return new Promise( ( resolve, reject ) => {
        this.bdd.query( "INSERT INTO `Vm` VALUES ('"+idvm+"')", function ( err, result ) {
          if ( err ) reject( err )
          resolve( result );
        })
      })
    
    }


}

module.exports = VM
