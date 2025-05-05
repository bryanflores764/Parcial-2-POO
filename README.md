# POSTMAIL API

API para gestionar envíos de POSTMAIL.

## Configuración

1. Crear el archivo .env para utilizar nuestras variables de entorno siguente ejemplo de como configurarlo
```
MONGO=MONGODB_URI://localhost:27017/POSMAIL
PORT=4000
```

2. Instala los node_modules:
```
npm install
```

3. Inicia el servidor:
```
npm run Posmail
```

El servidor se iniciará y se conectara ah mongoDB y si es primera vez probando la api se creara un usuario automaticamente 

### Gestión de créditos

#### Verificar créditos disponibles

-- En la terminal saldrá el id del usuario creado automaticamente
-- Ese id le aparecera solo una vez en la terminal asi que si lo apaga y lo inicia nuevamente tiene que ir ala base de datos donde esta su usuario y copiar el id
```
GET /api/usuario/:userId/creditos
```
en :userId debe poner el id que sale en la terminal una unica vez al iniciar el servidor por primera vez

Ejemplo de respuesta:
```json
{
  "mensaje": "Información de crédito",
  "data": {
    "creditos": 160,
    "envios": 60,
    "costo": 8.9
  }
}
```

#### Comprar créditos
```
POST /api/usuario/:userId/creditos
```
en :userId debe poner el id que sale en la terminal una unica vez al iniciar el servidor por primera vez

Cuerpo de la solicitud:
```json
{
  "plan": 1
}
```

los planes disponibles son:
- Plan 1: $135 por 30 envíos
- Plan 2: $160 por 40 envíos
- Plan 3: $180 por 60 envíos

### metodos de envios

#### peticion para crear todos los envios del usuario
```
POST /api/usuario/:userId/envio
```
En :userId debe poner el id que sale en la terminal una unica vez al iniciar el servidor por primera vez

Como hacer la solicitud:
```json
{
  "nombre": "Nombre del destinatario",
  "direccion": "Dirección del destinatario",
  "telefono": "Teléfono del destinatario",
  "referencia": "Referencia",
  "observacion": "Observaciones"
}
```

#### peticion para obtener todos envios del usuario
```
GET /api/usuario/:userId/envio
```
en :userId debe poner el id que sale en la terminal una unica vez al iniciar el servidor por primera vez

#### peticion para obtener envio por id 
```
GET /api/envio/:enviosId
```

#### peticion para eliminar envio por id 
```
DELETE /api/envio/:enviosId
```

Al eliminar el envio el credito se devuelve .

### Gestión de productos

#### peticion para agregar un producto a un envio
```
POST /api/envios/:enviosId/productos
```
en :enviosId va el id del envio al que quiere agregar el producto 

Como hacer la solicitud::
```json
{
  "descripcion": "Descripción del producto",
  "peso": 2,
  "paquetes": 3,
  "fecha_entrega": "2025-06-12"
}
```

Datos sobre el peso:
- Si el peso supera las 3 libras se cobra el doble.
- Si el peso supera las 6 libras se cobra el triple.

#### peticion para obtener productos de un envio
```
GET /api/envios/:enviosId/productos
```
en :enviosId va el id del envio al que quiere saber su informacion
#### peticion para actualizar la informacion del producto
```
PUT /api/productos/:productoId
```
en :productoId va el id del producto que quiere actualizar


Como hacer la solicitud::
```json
{
  "descripcion": "Descripción del producto",
  "peso": 7,
  "paquetes": 6,
  "fecha_entrega": "2025-04-12"
}
```

#### peticion para elimnar un producto
```
DELETE /api/productos/:productoId
```
en :productoId va el id del producto que quiere eliminar



#### rutas de todas las peticiones
              ('- GET /api/usuario/:userId/creditos - Verificar créditos disponibles');
              ('- POST /api/usuario/:userId/creditos - Comprar créditos');
              .('- POST /api/usuario/:userId/envio - Crear un nuevo envío');
              .('- GET /api/usuario/:userId/envio - Obtener envíos del usuario');
              .('- GET /api/envio/:enviosId - Obtener un envío específico');
              .('- DELETE /api/envio/:enviosId - Eliminar un envío');
              .('- POST /api/envios/:EnvioId/productos - Agregar producto a un envío');
              .('- GET /api/envios/:EnvioId/productos - Obtener productos de un envío');
              .('- PUT/productos/:productoId- Actualizar un producto');
              .('- DELETE /api/productos/:productoId - Eliminar un producto');
  
