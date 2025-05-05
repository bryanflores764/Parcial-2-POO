const express = require("express")
const { Enviroments } = require("./plugins/Enveriomen")
const {json} = require("express")
const cors = require("cors")

const Usuario = require('./models/Usuario')
const mongoose = require('mongoose')
const { MongoServidor } = require("./db/MongoServicio")
const {AppRouter} = require("./routes/rutas")

class Server {
    #server = express.application
    #port   = Enviroments.PORT

    constructor(
        server = express.application,
        port   = Enviroments.PORT
    ){
        this.#server = server
        this.#port   = port
    }


    async seedDatabase() {
        try {
            console.log('Verificando datos iniciales...');
            

            const contadorUsuarios = await Usuario.countDocuments();
            
            if (contadorUsuarios === 0) {
                console.log('Inicializando base de datos con datos de prueba...');
                

                const testUser = new Usuario({
                    nombre: 'bryan ronaldo lfores',
                    email: '@postmail.com',
                    creditos: {
                        amount: 0,
                        envio: 0,
                        costo: 0
                    }
                });
                
                await testUser.save();
                
                console.log('Base de datos inicializada exitosamente');
                console.log('ID del usuario de prueba:', testUser._id);
            } else {
                console.log('La base de datos ya contiene datos.');
              
            }
        } catch (error) {
            console.error('Error al inicializar la base de datos:', error);
            throw error;
        }
    }

    async initServer(){
        try {
            const mongodb = new MongoServidor(Enviroments.MONGO)
            await mongodb.inicioServidor();
            
            await this.seedDatabase();
            
            this.#server.use(json());
            this.#server.use(cors());
            
            this.#server.use("/api", AppRouter.iniciorutas());
            

            this.#server.listen(this.#port, () => {
             
                console.log(`Servidor ejecutándose en http://localhost:${this.#port}`);
                console.log('Para probar la API, utilice los siguientes endpoints:');
                console.log('- GET /api/usuario/:userId/creditos - Verificar créditos disponibles');
                console.log('- POST /api/usuario/:userId/creditos - Comprar créditos');
                console.log('- POST /api/usuario/:userId/envio - Crear un nuevo envío');
                console.log('- GET /api/usuario/:userId/envio - Obtener envíos del usuario');
                console.log('- GET /api/envio/:enviosId - Obtener un envío específico');
                console.log('- DELETE /api/envio/:enviosId - Eliminar un envío');
                console.log('- POST /api/envios/:EnvioId/productos - Agregar producto a un envío');
                console.log('- GET /api/envios/:EnvioId/productos - Obtener productos de un envío');
                console.log('- PUT/productos/:productoId- Actualizar un producto');
                console.log('- DELETE /api/productos/:productoId - Eliminar un producto');
            });
            
        } catch (error) {
            console.error('Error al iniciar el servidor:', error);
            throw new Error(`${error}`);
        }
    }
}


const server = new Server(express(), Enviroments.PORT);
server.initServer();