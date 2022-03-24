const mysql = require('mysql');




class bdd {
    constructor(login, mdp, ip){
        /*this.login = _login;
        this.mdp = _mdp;
        this.ip = _ip;*/



        this.db = mysql.createConnection({

            host: "192.168.65.201",
         
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

    getDB ( ) {

      return this.db;

    }

}

module.exports = bdd
