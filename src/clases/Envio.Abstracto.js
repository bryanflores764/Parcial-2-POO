class EnvioAbstracto {
    #nombre;
    #direccion;
    #telefono;
    #referencia;
    #observacion;
  
    constructor(nombre, direccion, telefono, referencia, observacion) {
      this.#nombre = nombre;
      this.#direccion = direccion;
      this.#telefono = telefono;
      this.#referencia = referencia;
      this.#observacion = observacion;
    }
  
    get envio() {
      return {
        nombre: this.#nombre,
        direccion: this.#direccion,
        telefono: this.#telefono,
        referencia: this.#referencia,
        observacion: this.#observacion,
      };
    }
  }
  
  module.exports = { EnvioAbstracto };