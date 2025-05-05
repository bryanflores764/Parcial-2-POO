class ProductoAbstracto {
    #descripcion;
    #peso;
    #paquetes;
    #fecha_entrega;
  
    constructor(descripcion, peso, paquetes, fecha_entrega) {
      this.#descripcion = descripcion;
      this.#peso = peso;
      this.#paquetes = paquetes;
      this.#fecha_entrega = fecha_entrega;
    }
  
    get product() {
      return {
        descripcion: this.#descripcion,
        peso: this.#peso,
        paquetes: this.#paquetes,
        fecha_entrega: this.#fecha_entrega,
      };
    }
  
    get weight() {
      return this.#peso;
    }
  }
  
  module.exports = { ProductoAbstracto };