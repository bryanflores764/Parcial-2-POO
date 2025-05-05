require("dotenv/config")


const Enviroments = {
    MONGO : process.env.MONGODB_URI,
    PORT : process.env.PORT
}


module.exports = {
    Enviroments
}