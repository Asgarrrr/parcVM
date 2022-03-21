const base = require("./bdd.js");


( async( ) => {

    var bdd = new base("229070_lucas", "lucasglapro", "lucaslapro_projetvm");
    const test = await bdd.GetAllUser();

    console.log( test )

})( );