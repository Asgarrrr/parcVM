
const mysql = require( "mysql2/promise" );

class bdd {

    constructor( host, user, password, database, port = 3306 ) {

        this.host       = host;
        this.user       = user;
        this.password   = password;
        this.database   = database;
        this.port       = port;

    }

    async connect( ) {

        try {

            this.bdd = await mysql.createConnection({
                host     : this.host,
                user     : this.user,
                password : this.password,
                database : this.database,
                port     : this.port
            });

            console.log( "Connexion à la base de données réussie 🌠" );

            return this.bdd;


        } catch ( error ) {

            throw new Error( "Impossible de se connecter à la base de données" );

        }

    }

    getBDD( ) {

        return this.bdd;

    }

}

module.exports = bdd
