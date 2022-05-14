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

        this.bdd = await mysql.createConnection({
            host     : this.host,
            user     : this.user,
            password : this.password,
            database : this.database,
            port     : this.port
        });

        return this.bdd;

    }

    getBDD ( ) {

        return this.bdd;

    }

}

module.exports = bdd
