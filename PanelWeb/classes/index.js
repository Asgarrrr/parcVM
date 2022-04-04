const base = require("./bdd.js");
const User = require("./User.js");
const vm = require("./VM.js");


( async( ) => {

    var bdd = new base("admin", "admin", "lucaslapro_projetvm");

    const test = new User( bdd.getDB( ) );
    const bddvm = new vm( bdd.getDB( ) );

    

    //console.log( await test.GetAllUser() )
    //await test.CreateUser("ksjdf","lascsdfsdfossise","sdfsdfsdf@filsdepute.fr","prout")
    //await bddvm.inservm("210")
    //await test.DeleteUser("7")
    //await test.GetUserbyId("1") 
    //await test.EditUser("4", "phillipouille", "greg", "mionculcestbonla","" ) 
    //console.log(await test.FindSession("8UUPP78GaljA100nXjAhVkZO6gkxvJPL5DEus7Vktd536wk1FET3NkuoktWik5Dc"))

})( );