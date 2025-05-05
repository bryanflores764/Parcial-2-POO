const modelProducto = require("../models/Producto");
const EnvioModel = require("../models/Envio");
const Usuario = require("../models/Usuario");
const mongoose = require("mongoose");
const { ProductoAbstracto } = require("../clases/Producto.Abstracto");
const { ObjectId } = mongoose.Types;

class ProductoControlador extends ProductoAbstracto {
  #EnvioId;

  constructor(descripcion, peso, paquetes, fecha_entrega, EnvioId) {
    super(descripcion, peso, paquetes, fecha_entrega);
    this.#EnvioId = EnvioId;
  }

  calculateCost(costoBase) {
    let costoMultiplicador = 1;
    const peso = parseFloat(this.weight);

    if (peso > 6) {
      costoMultiplicador = 3;
    } else if (peso > 3) {
      costoMultiplicador = 2;
    }

    return costoBase * costoMultiplicador;
  }

  static async calcularPesoTotal(EnvioId, session) {
    const productos = await modelProducto.find({ EnvioId }).session(session);
    let pesoTotal = 0;

    productos.forEach(producto => {
      pesoTotal += parseFloat(producto.peso);
    });

    return pesoTotal;
  }

  static async agregarProducto(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { EnvioId } = req.params;
      const { descripcion, peso, paquetes, fecha_entrega } = req.body;

      if (!ObjectId.isValid(EnvioId)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "ID de envío inválido",
        });
      }

      if (!descripcion || !peso || !paquetes || !fecha_entrega) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "Faltan datos requeridos para el producto",
        });
      }

      const envio = await EnvioModel.findById(EnvioId).session(session);

      if (!envio) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          message: "Envío no encontrado",
        });
      }

      const usuario = await Usuario.findById(envio.usuarioId).session(session);

      if (!usuario) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      const productoControlador = new ProductoControlador(
        descripcion,
        peso,
        paquetes,
        fecha_entrega,
        EnvioId
      );

      const producto = new modelProducto({
        EnvioId,
        ...productoControlador.product,
      });

      await producto.save({ session });

      const productos = await modelProducto.find({ EnvioId }).session(session);
      let pesoTotal = 0;

      productos.forEach(prod => {
        pesoTotal += parseFloat(prod.peso);
      });

      let costoMultiplicador = 1;
      if (pesoTotal > 6) {
        costoMultiplicador = 3;
      } else if (pesoTotal > 3) {
        costoMultiplicador = 2;
      }

      const costoBase = usuario.creditos.costo;
      const costoAnterior = envio.costo;
      const nuevoCosto = costoBase * costoMultiplicador;

      if (costoAnterior > 0) {
        usuario.creditos.amount += costoAnterior;
      }

      if (usuario.creditos.amount < nuevoCosto) {
        await modelProducto.findByIdAndDelete(producto._id).session(session);

        if (costoAnterior > 0) {
          usuario.creditos.amount -= costoAnterior;
          await usuario.save({ session });
        }

        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          message: "Créditos insuficientes para este envío con el peso total",
          required: nuevoCosto,
          available: usuario.creditos.amount,
          pesoTotal: pesoTotal,
        });
      }

      envio.costo = nuevoCosto;
      await envio.save({ session });

      usuario.creditos.amount -= nuevoCosto;
      await usuario.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        message: "Producto agregado exitosamente",
        data: {
          producto,
          pesoTotal: pesoTotal,
          costoEnvio: nuevoCosto,
          costoMultiplicador: costoMultiplicador,
          creditosRestantes: usuario.creditos.amount,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error al agregar producto:", error);
      return res.status(500).json({
        message: "Error al agregar el producto",
        error: error.message,
      });
    }
  }

  static async obtenerEnvíoProductos(req, res) {
    try {
      const { EnvioId } = req.params;

      if (!ObjectId.isValid(EnvioId)) {
        return res.status(400).json({
          message: "ID de envío inválido",
        });
      }

      const productos = await modelProducto.find({ EnvioId });

      return res.status(200).json({
        message: "Productos del envío",
        data: productos,
      });
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return res.status(500).json({
        message: "Error al obtener los productos",
        error: error.message,
      });
    }
  }

  static async actualizarProducto(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { productoId } = req.params;
      const { descripcion, peso, paquetes, fecha_entrega } = req.body;

      if (!ObjectId.isValid(productoId)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "ID de producto inválido",
        });
      }

      const producto = await modelProducto.findById(productoId).session(session);

      if (!producto) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          message: "Producto no encontrado",
        });
      }

      const pesoAnterior = parseFloat(producto.peso);

      if (descripcion) producto.descripcion = descripcion;
      if (peso) producto.peso = peso;
      if (paquetes) producto.paquetes = paquetes;
      if (fecha_entrega) producto.fecha_entrega = new Date(fecha_entrega);

      await producto.save({ session });

      if (peso) {
        const envio = await EnvioModel.findById(producto.EnvioId).session(session);
        const usuario = await Usuario.findById(envio.usuarioId).session(session);

        if (envio.costo > 0) {
          usuario.creditos.amount += envio.costo;
        }

        const pesoTotal = await ProductoControlador.calcularPesoTotal(producto.EnvioId, session);

        let costoMultiplicador = 1;
        if (pesoTotal > 6) {
          costoMultiplicador = 3;
        } else if (pesoTotal > 3) {
          costoMultiplicador = 2;
        }

        const costoBase = usuario.creditos.costo;
        const nuevoCosto = costoBase * costoMultiplicador;

        if (usuario.creditos.amount < nuevoCosto) {
          producto.peso = pesoAnterior;
          await producto.save({ session });

          usuario.creditos.amount -= envio.costo;

          await session.abortTransaction();
          session.endSession();

          return res.status(400).json({
            message: "Créditos insuficientes para actualizar el producto",
            required: nuevoCosto,
            available: usuario.creditos.amount,
            pesoTotal: pesoTotal,
          });
        }

        envio.costo = nuevoCosto;
        await envio.save({ session });

        usuario.creditos.amount -= nuevoCosto;
        await usuario.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Producto actualizado exitosamente",
        data: producto,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error al actualizar producto:", error);
      return res.status(500).json({
        message: "Error al actualizar el producto",
        error: error.message,
      });
    }
  }

  static async eliminarProducto(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { productoId } = req.params;

      if (!ObjectId.isValid(productoId)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "ID de producto inválido",
        });
      }

      const producto = await modelProducto.findById(productoId).session(session);

      if (!producto) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          message: "Producto no encontrado",
        });
      }

      const EnvioId = producto.EnvioId;

      await modelProducto.findByIdAndDelete(productoId).session(session);

      const envio = await EnvioModel.findById(EnvioId).session(session);
      const usuario = await Usuario.findById(envio.usuarioId).session(session);

      const pesoTotal = await ProductoControlador.calcularPesoTotal(EnvioId, session);

      let costoMultiplicador = 1;
      if (pesoTotal > 6) {
        costoMultiplicador = 3;
      } else if (pesoTotal > 3) {
        costoMultiplicador = 2;
      }

      const costoBase = usuario.creditos.costo;
      const nuevoCosto = pesoTotal > 0 ? costoBase * costoMultiplicador : 0;

      if (envio.costo !== nuevoCosto) {
        usuario.creditos.amount += envio.costo;

        envio.costo = nuevoCosto;
        await envio.save({ session });

        if (nuevoCosto > 0) {
          usuario.creditos.amount -= nuevoCosto;
        }

        await usuario.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Producto eliminado exitosamente",
        data: {
          pesoTotal: pesoTotal,
          costoEnvioActualizado: envio.costo,
          creditosRestantes: usuario.creditos.amount,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error al eliminar producto:", error);
      return res.status(500).json({
        message: "Error al eliminar el producto",
        error: error.message,
      });
    }
  }
}

module.exports = { ProductoControlador };