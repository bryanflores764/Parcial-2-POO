const mongoose = require("mongoose");

const envioSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    nombre: {
      type: String,
      required: true,
    },
    direccion: {
      type: String,
      required: true,
    },
    telefono: {
      type: String,
      required: true,
    },
    referencia: {
      type: String,
      required: true,
    },
    observacion: {
      type: String,
    },
    costo: {
      type: Number,
      default: 0,
    },
    estado: {
      type: String,
      enum: ["pendiente", "entregada", "cancelada"],
      default: "pendiente",
    },
  },
  {
    timestamps: true,
  }
);

const EnvioModel = mongoose.model("Envio", envioSchema);

module.exports = EnvioModel;