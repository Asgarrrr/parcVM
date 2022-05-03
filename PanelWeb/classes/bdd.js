const mysql = require('mysql');




class bdd {
    constructor(ip, login, mdp, base){
        /*this.login = _login;
        this.mdp = _mdp;
        this.ip = _ip;*/



        this.bdd = mysql.createConnection({

            host: ip,
         
            user: login,
         
            password: mdp,

            database : base
         
          })
          this.bdd.connect(function(err) {
            if (err) throw err;
            console.log("Connecté à la base de données Abyss 🌠");
          })

          /*db.query("SELECT * FROM users", function (err, result) {
            if (err) throw err;
            console.log(result);
          })*/
          ;

    }

    getBDD ( ) {

      return this.bdd;

    }

}

module.exports = bdd
