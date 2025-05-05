const { Enviroments } = require("../plugins/Enveriomen");
const {connect} = require("mongoose")


class MongoServidor {

    #url = Enviroments.MONGO

    constructor(
        url = Enviroments.MONGO

    ){
        this.url = url
    }

    async inicioServidor(){
        try {
            
            await connect(this.#url)
            console.log("conectado ah mongo exitosamente");
            

        } catch (error) {
            throw new Error(`${error}`)
        }
    }
}


module.exports = {
    MongoServidor
}