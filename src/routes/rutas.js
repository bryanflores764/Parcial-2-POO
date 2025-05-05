const { Router } = require("express");
const { EnvioControlador } = require("../controller/Envio.controlador");
const { ProductoControlador } = require("../controller/Producto.Controlador");

class AppRouter {
  static iniciorutas() {
    try {
      const router = Router();

      // Rutas para usuarios y créditos
      router.get("/usuario/:usuarioId/creditos", EnvioControlador.chequeCrédito);
      router.post("/usuario/:usuarioId/creditos", EnvioControlador.comprarCréditos);

      // Rutas para envíos
      router.post("/usuario/:usuarioId/envio", EnvioControlador.crearEnvío);
      router.get("/usuario/:usuarioId/envio", EnvioControlador.obtenerEnvíosDeUsuarios);
      router.get("/envio/:enviosId", EnvioControlador.obtener_envío);
      router.delete("/envio/:enviosId", EnvioControlador.eliminarEnvío);

      // Rutas para productos
      router.post('/envios/:EnvioId/productos', ProductoControlador.agregarProducto);
      router.get('/envios/:EnvioId/productos', ProductoControlador.obtenerEnvíoProductos);
      router.put('/productos/:productoId', ProductoControlador.actualizarProducto);
      router.delete('/productos/:productoId', ProductoControlador.eliminarProducto)

      return router;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }
}

module.exports = { AppRouter };