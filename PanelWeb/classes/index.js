const base = require("./bdd.js");
const User = require("./User.js");
const vm = require("./VM.js");


( async( ) => {

    var bdd = new base("admin", "admin", "lucaslapro_projetvm");

    const test = new User( bdd.getDB( ) );
    const bddvm = new vm( bdd.getDB( ) );

    

    //console.log( await test.GetAllUser() )
    //await test.CreateUser("chris","lascossise","sdfsdfsdf@filsdepute.fr","")
    //await bddvm.inservm("110")
    //await test.DeleteUser("7")
    //await test.GetUserbyId("1") 
    //await test.EditUser("4", "phillipouille", "greg", "mionculcestbonla","" ) 

})( );