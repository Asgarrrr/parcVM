class VM {

    constructor(bdd) {

        this.bdd = bdd;

    }

    async selectvm( idvm ) {

        if ( idvm.length ) {

            const [ rows ] = await this.bdd.execute( "SELECT * FROM Vm WHERE IdVm = ?", [ idvm ] );
            return rows;

        } else {

            const [ rows ] = await this.bdd.execute( "SELECT * FROM Vm" );
            return rows;

        }

    }

    async inservm( idvm ) {

        const [ rows ] = await this.bdd.execute( "INSERT INTO Vm ( IdVm ) VALUES ( ? )", [ idvm ] );
        return rows

    }

    async deletevm( idvm ) {

        const [ rows ] = await this.bdd.execute( "DELETE FROM Vm WHERE IdVm = ?", [ idvm ] );
        return rows;

    }


}

module.exports = VM