const EnvioModel = require("../models/Envio");
const Usuario = require("../models/Usuario");
const Producto = require("../models/Producto");
const mongoose = require("mongoose");
const { EnvioAbstracto } = require("../clases/Envio.Abstracto");
const { ObjectId } = mongoose.Types;

class EnvioControlador extends EnvioAbstracto {
  #usuarioId;

  constructor(nombre, direccion, telefono, referencia, observacion, usuarioId) {
    super(nombre, direccion, telefono, referencia, observacion);
    this.#usuarioId = usuarioId;
  }

  static async chequeCrédito(req, res) {
    try {
      const { usuarioId } = req.params;

      if (!ObjectId.isValid(usuarioId)) {
        return res.status(400).json({
          message: `ID inválido ${usuarioId}`,
        });
      }

      const usuario = await Usuario.findById(usuarioId);

      if (!usuario) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      return res.status(200).json({
        message: "Información de crédito",
        data: {
          creditos: usuario.creditos.amount,
          envios: usuario.creditos.envio,
          costo: usuario.creditos.costo,
        },
      });
    } catch (error) {
      console.error("Error al verificar crédito:", error);
      return res.status(500).json({
        message: "Error al verificar el crédito",
        error: error.message,
      });
    }
  }

  static async crearEnvío(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { usuarioId } = req.params;
      const { nombre, direccion, telefono, referencia, observacion } = req.body;

      if (!ObjectId.isValid(usuarioId)) {
        return res.status(400).json({
          message: "ID de usuario inválido"
      });
      }

       
      if (!nombre || !direccion || !telefono || !referencia) {
        return res.status(400).json({
            message: "Faltan datos requeridos para el envío"
        });
    }

      const usuario = await Usuario.findById(usuarioId).session(session);

      if (!usuario) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      if (usuario.creditos.amount <= 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "No tiene créditos disponibles para envíos",
        });
      }

      if (usuario.creditos.amount < usuario.creditos.costo) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
            message: "No tiene suficientes créditos monetarios para este envío",
            required: user.credits.cost,
            available: user.credits.amount
        });
    }

      const envioControlador = new EnvioControlador(
        nombre,
        direccion,
        telefono,
        referencia,
        observacion,
        usuarioId
      );

      const envio = new EnvioModel({
        usuarioId,
        ...envioControlador.envio,
        costo: usuario.creditos.costo,
      });

      await envio.save({ session });

      usuario.creditos.envio += 1;
      usuario.creditos.amount -=usuario.creditos.costo
      await usuario.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        message: "Envío creado exitosamente",
        data: envio,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error al crear envío:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Error de validación",
          error: error.message,
        });
      }

      return res.status(500).json({
        message: "Error al crear el envío",
        error: error.message,
      });
    }
  }

  static async obtenerEnvíosDeUsuarios(req, res) {
    try {
      const { usuarioId } = req.params;

      if (!ObjectId.isValid(usuarioId)) {
        return res.status(400).json({
          message: "ID de usuario inválido",
        });
      }

      const envios = await EnvioModel.find({ usuarioId });

      return res.status(200).json({
        message: "Envíos del usuario",
        data: envios,
      });
    } catch (error) {
      console.error("Error al obtener envíos:", error);
      return res.status(500).json({
        message: "Error al obtener los envíos",
        error: error.message,
      });
    }
  }

  static async obtener_envío(req, res) {
    try {
      const { enviosId } = req.params;

      if (!ObjectId.isValid(enviosId)) {
        return res.status(400).json({
          message: "ID de envío inválido",
        });
      }

      const envio = await EnvioModel.findById(enviosId);

      if (!envio) {
        return res.status(404).json({
          message: "Envío no encontrado",
        });
      }

      const producto = await Producto.find({ EnvioId: enviosId });

      return res.status(200).json({
        mensaje: "Detalles del envío",
        data: {
          envio,
          producto,
        },
      });
    } catch (error) {
      console.error("Error al obtener envío:", error);
      return res.status(500).json({
        message: "Error al obtener el envío",
        error: error.message,
      });
    }
  }

  static async eliminarEnvío(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { enviosId } = req.params;

      if (!ObjectId.isValid(enviosId)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "ID de envío inválido",
        });
      }

      const envio = await EnvioModel.findById(enviosId).session(session);

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
      const envioCosto = envio.costo
      usuario.creditos.envio += 1;
      if (envioCosto > 0) {
        usuario.creditos.amount += envioCosto;
    }
      await usuario.save({ session });

      await Producto.deleteMany({ EnvioId: enviosId }).session(session);

      await EnvioModel.findByIdAndDelete(enviosId).session(session);

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Envío eliminado y crédito devuelto exitosamente",
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error al eliminar envío:", error);
      return res.status(500).json({
        message: "Error al eliminar el envío",
        error: error.message,
      });
    }
  }

  static async comprarCréditos(req, res) {
    try {
      const { usuarioId } = req.params;
      const { plan } = req.body;

      if (!ObjectId.isValid(usuarioId)) {
        return res.status(400).json({
          message: "ID de usuario inválido",
        });
      }

      const usuario = await Usuario.findById(usuarioId);

      if (!usuario) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      let amount, envios, costo;

      switch (plan) {
        case 1:
          amount = 135;
          envios = 30;
          costo = amount / envios;
          break;
        case 2:
          amount = 160;
          envios = 40;
          costo = amount / envios;
          break;
        case 3:
          amount = 180;
          envios = 60;
          costo = amount / envios;
          break;
        default:
          return res.status(400).json({
            message: "Plan no válido. Elija entre 1, 2 o 3.",
          });
      }

      usuario.creditos = {
        amount,
        envios,
        costo,
      };

      await usuario.save();

      return res.status(200).json({
        message: "Créditos comprados exitosamente",
        data: {
          creditos: usuario.creditos,
        },
      });
    } catch (error) {
      console.error("Error al comprar créditos:", error);
      return res.status(500).json({
        message: "Error al comprar créditos",
        error: error.message,
      });
    }
  }
}

module.exports = { EnvioControlador };