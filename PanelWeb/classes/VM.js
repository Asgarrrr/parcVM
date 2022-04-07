const mysql = require('mysql');

class VM {

    constructor( bdd ){

      this.bdd = bdd;

    }



    selectvm(idvm) {

      if ( idvm.length ) {

        return new Promise( ( resolve, reject ) => {
          this.bdd.query( "SELECT * FROM Vm WHERE IdVm = '"+idvm+"'", function ( err, result ) {
            if ( err ) reject( err )
            resolve( result );
          })
        })

      } else {

        return new Promise( ( resolve, reject ) => {
          this.bdd.query( "SELECT * FROM Vm", function ( err, result ) {
            if ( err ) reject( err )
            resolve( result );
          })
        })

      }

      
    
    }

    inservm(idvm){
      return new Promise( ( resolve, reject ) => {
        this.bdd.query( "INSERT INTO `Vm` VALUES ('"+idvm+"')", function ( err, result ) {
          if ( err ) reject( err )
          resolve( result );
        })
      })
    }


}

module.exports = VM
