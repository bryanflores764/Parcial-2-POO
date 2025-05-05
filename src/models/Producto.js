const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema(
  {
    EnvioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Envio",
      required: true,
    },
    descripcion: {
      type: String,
      required: true,
    },
    peso: {
      type: Number,
      required: true,
    },
    paquetes: {
      type: Number,
      required: true,
    },
    fecha_entrega: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const modelProducto = mongoose.model("Producto", productoSchema);

module.exports = modelProducto;