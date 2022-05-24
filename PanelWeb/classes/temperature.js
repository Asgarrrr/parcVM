module.exports = class Temperature {

    constructor( bdd ) {

        this.bdd = bdd;

    }

    insertTemp( temp ) {

        this.bdd.query( "INSERT INTO Temperature ( temp ) VALUES ( ? )", [ temp ] );

    }

    async getTemp() {

        const [ rows ] = await this.bdd.execute( `SELECT * FROM Temperature ORDER BY IdTemp DESC LIMIT 1` );
        return rows;

    }

}