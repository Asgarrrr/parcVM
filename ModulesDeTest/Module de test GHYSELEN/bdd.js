const mysql = require('mysql');




class bdd {
    constructor(login, mdp, ip){
        /*this.login = _login;
        this.mdp = _mdp;
        this.ip = _ip;*/



        this.db = mysql.createConnection({

            host: "mysql-lucaslapro.alwaysdata.net",
         
            user: login,
         
            password: mdp,

            database : ip
         
          })
          this.db.connect(function(err) {
            if (err) throw err;
            console.log("Connecté à la base de données MySQL!");
          })

          /*db.query("SELECT * FROM users", function (err, result) {
            if (err) throw err;
            console.log(result);
          })*/
          ;

    }

    GetAllUser() {

      return new Promise( ( resolve, reject ) => {
        this.db.query( "SELECT * FROM users", function ( err, result ) {
          if ( err ) reject( err )
          resolve( result );
        })
      })
    
    }
}

module.exports = bdd
//new bdd('mysql-lucaslapro.alwaysdata.net', '229070_lucas', 'lucasglapro');
