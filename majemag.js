/* eslint-disable keyword-spacing */
/* eslint-disable space-before-function-paren */
/* eslint-disable no-undef */
/// <reference path="node_modules/@types/p5/global.d.ts" />

/**
 * @typedef { {x: number, y: number, id: number, asignado:boolean} } BlobCamara
 * @typedef { {x: number, y: number, w: number, h: number } } Caja
 * @typedef { Izquierda |  Derecha |  Arriba} PuertaConcreta
 * @typedef {typeof Izquierda |typeof  Derecha | typeof Arriba} TipoPuertaConcreta
 * @typedef {{x: number, y: number}} Posicion
 */

const tamanoSprite = 16

/**
 * Para no tener que hacer `Array.from` en el find, esto es un poco más rápido
 * @template T
 * @param {Iterable<T>} iterador
 * @param {function(T): boolean} funcion
 */
function encontrar(iterador, funcion) {
  for (const elemento of iterador) {
    if (funcion(elemento)) return elemento
  }
}

/**
 * Las versiones modernas de p5js parecen tener `deltaTime`, pero
 * la de MLP no
 * @returns {number} El delta de tiempo en **milisegundos**
 */
function delta() {
  const fr = frameRate()
  // lo de devolver 1 es un pequeño arreglo para que la función
  // no devuelva nunca 0, para no tener que controlarlo con `ifs`
  // en las divisiones
  return fr === 0 ? 1 : 1000 / fr
}

class Entidad {
  /**
   * @param {Habitacion} habitacion
   * @param {number} x
   * @param {number} y
   * @param {number} w
   */
  constructor(habitacion, x = 0, y = 0, w, h = w) {
    this.habitacion = habitacion
    this.mover(x, y)
    this.w = w
    this.h = h
    this.tiempoAnimacion = 0
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  mover(x, y) {
    this.x = x
    this.y = y
  }


  // Para que TS no proteste, igual hay una manera mejor
  dibujar() { }

  /**
   * @param { Caja } input
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  solapa(input, y = undefined, w = undefined, h = undefined) {
    /** @type { Caja } */
    const other = typeof input === 'number' ? { x: input, y, w, h } : input
    return this.x < other.x + other.w &&
      this.x + this.w > other.x &&
      this.y < other.y + other.h &&
      this.h + this.y > other.y
  }

  actualizar() { }
}

class EntidadAnimada extends Entidad {
  /**
   * @param {Habitacion} habitacion
   * @param {string} animacion
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  constructor(habitacion, animacion, x, y, w, h = w) {
    super(habitacion, x, y, w, h)
    this.animar(animacion)
  }

  /**
   * @param {string} animacion
   */
  animar(animacion) {
    this.animacion = animaciones[animacion]
    this.establecerFotograma()
    this.tiempoAnimacion = 0
    this.terminadaLlamada = false
  }

  establecerFotograma(fotograma = 0) {
    this.imagen = imagenes[this.animacion.fotogramas[fotograma]]
    this.fotograma = fotograma
  }

  actualizar() {
    super.actualizar()

    this.tiempoAnimacion += delta()
    if (this.tiempoAnimacion >= this.animacion.periodo) {
      this.tiempoAnimacion = 0
      const l = this.animacion.fotogramas.length

      if (this.fotograma === l - 1) {
        // hemos dado la vuelta

        if (this.animacion.terminada && !this.terminadaLlamada) {
          this.animacion.terminada(this)
          this.terminadaLlamada = true
        }
        if (this.animacion.vuelta) {
          this.establecerFotograma()
        }
      } else {
        this.establecerFotograma(this.fotograma + 1)
      }
    }
  }

  dibujar(x = this.x, y = this.y) {
    image(this.imagen, x, y)
  }
}

class Texto extends Entidad {
  /**
   * @param {Habitacion} habitacion
   * @param {string} cadena
   * @param {number} [y]
   */
  constructor(habitacion, cadena, y) {
    super(habitacion, 0, y, Habitacion.ancho, Texto.tamano)
    this.cadena = cadena
  }

  dibujar() {
    fill('white')
    // noStroke()
    stroke('black')
    text(this.cadena, this.x, this.y, this.w, this.h)
  }
}

Texto.tamano = undefined


class Titulo extends Texto {
  /**
   * @param {Habitacion} h
   * @param {string} c
   */
  constructor(h, c) {
    super(h, c, Habitacion.alto / 2 - Texto.tamano)
  }
}

class Subtitulo extends Texto {
  /**
   * @param {Habitacion} h
   * @param {string} c
   */
  constructor(h, c) {
    super(h, c, Habitacion.alto / 2)
  }
}

class Info extends Texto {
  /**
   * @param {Habitacion} h
   * @param {string} c
   */
  constructor(h, c) {
    super(h, c, Habitacion.alto / 2 + Texto.tamano)
  }
}

class Puerta extends EntidadAnimada {
  /**
   * @param {Habitacion} habitacion
   * @param {number} x
   * @param {number} y
   */
  constructor(habitacion, x, y, w = Puerta.anchoPuerta, h = Puerta.altoPuerta) {
    super(habitacion, 'puertaAbierta', x, y, w, h)
    /** @type {number} */
    this.tiempoSalida = Puerta.maxTiempoSalida
    this.activa = true
  }

  actualizar() {
    super.actualizar()
    if (this.activa) {
      this.tiempoSalida =
        encontrar(this.habitacion.personas.values(), p => p.solapa(this))
          ? this.tiempoSalida - delta()
          : Puerta.maxTiempoSalida

      if (this.tiempoSalida <= 0 && !this.habitacion.transicion) {
        this.habitacion.siguiente(
          // @ts-ignore
          this.constructor
        )
      }
    }
  }
}

Puerta.anchoPuerta = 18
Puerta.altoPuerta = 10
Puerta.maxTiempoSalida = 2000

class Izquierda extends Puerta {
  /**
   * @param {Habitacion} habitacion
   */
  constructor(habitacion) {
    super(habitacion, 0, Puerta.lateral, Puerta.altoPuerta, Puerta.anchoPuerta)
  }

  dibujar() {
    push()
    translate(this.x, this.y + Puerta.anchoPuerta)
    rotate(-HALF_PI)
    super.dibujar(0, 0)
    pop()
  }
}

class Derecha extends Puerta {
  /**
   * @param {Habitacion} habitacion
   */
  constructor(habitacion) {
    super(habitacion, Habitacion.ancho - Puerta.altoPuerta, Puerta.lateral, Puerta.altoPuerta, Puerta.anchoPuerta)
  }

  dibujar() {
    push()
    translate(this.x + Puerta.altoPuerta, this.y)
    rotate(HALF_PI)
    super.dibujar(0, 0)
    pop()
  }
}

class Arriba extends Puerta {
  /**
   * @param {Habitacion} habitacion
   */
  constructor(habitacion) {
    super(habitacion, Habitacion.ancho / 2 - Puerta.anchoPuerta / 2, 0)
  }
}

class Enemigo extends EntidadAnimada {
  /**
   * @param {Habitacion} habitacion
   * @param {number} x
   * @param {number} y
   * @param {number} ancho
   * @param {number} alto
   * @param {any} vida
   * @param {string} animacion
   */
  constructor(habitacion, animacion, x, y, ancho, alto, vida, animacionMuerte) {
    super(habitacion, animacion, x, y, ancho, alto)
    this.vida = vida
    this.experiencia = this.vida
    this.animacionMuerte = animacionMuerte
  }

  /** @return {boolean} */
  golpeado() {
    this.vida -= 1 // dueno.nivel
    const muerto = this.vida <= 0
    if (muerto) {
      this.animar(this.animacionMuerte)
    }
    return muerto
  }
}

class Fantasma extends Enemigo {
  /**
   * @param {Habitacion} h
   * @param {number} x
   * @param {number} y
   */
  constructor(h, x, y) {
    super(h, 'fantasma', x, y, Fantasma.tamano, Fantasma.tamano, 1, 'fantasmaMuerto')
    this.nuevoDestino()
    this.vivo = true
  }

  golpeado() {
    return (this.vivo = !super.golpeado())
  }

  nuevoDestino() {
    /** @type {Posicion} */
    this.destino = Habitacion.posicionAleatoria()
  }

  actualizar() {
    super.actualizar()
    if (this.vivo) {
      if (dist(this.x, this.y, this.destino.x, this.destino.y) < Fantasma.tamano) {
        this.nuevoDestino()
      }
      const v = Fantasma.velocidad / delta()
      const angulo = atan2(this.destino.y - this.y, this.destino.x - this.x)
      this.x += v * cos(angulo)
      this.y += v * sin(angulo)
    }
  }
}
Fantasma.velocidad = 4
Fantasma.tamano = tamanoSprite

class Persona extends EntidadAnimada {
  /**
   * @param {Habitacion} habitacion
   * @param {number} x
   * @param {number} y
   * @param {string} animacion
   * @param {number} id
   */
  constructor(id, habitacion, animacion, x, y) {
    super(habitacion, animacion, x, y, Persona.tamanoPersona)
    this.id = id
    this.tiempoDisparo = random(Persona.maxTiempoDisparo)
    this.direccion = random(TWO_PI)
  }

  /** @param {BlobCamara} blob */
  equivalentePosicion(blob) {
    return dist(blob.x, blob.y, this.x, this.y) < Persona.distanciaReconocimento
  }

  /** @param {BlobCamara} blob */
  equivalenteId(blob) {
    return blob.id === this.id
  }

  actualizar() {
    super.actualizar()
    this.sincronizarConBlobsId()

    if (this.habitacion.enemigos.size > 0) {
      this.tiempoDisparo += delta()

      if (this.tiempoDisparo >= Persona.maxTiempoDisparo) {
        this.disparar()
        this.tiempoDisparo = 0
      }
    }
  }

  disparar() {
  }

  /**
   * @param {function(BlobCamara): boolean} f
   */
  asignarBlob(f) {
    const blob = this.habitacion.blobs.find(f)

    if (blob !== undefined) {
      const x = blob.x - this.x
      const y = blob.y - this.y
      if (!(x === 0 && y === 0)) {
        this.mover(blob.x, blob.y)
        this.direccion = atan2(y, x)
      }
      blob.asignado = true
    } else {
      this.habitacion.eliminarPersona(this)
    }
  }

  sincronizarConBlobsPosicion() {
    this.asignarBlob(b => this.equivalentePosicion(b))
  }

  sincronizarConBlobsId() {
    this.asignarBlob(b => this.equivalenteId(b))
  }
}


Persona.maxTiempoDisparo = 3000
Persona.maximoNivel = 3
Persona.tamanoPersona = tamanoSprite
Persona.distanciaReconocimento = 10

class Magia extends Persona {
  /**
   * @param {Habitacion} habitacion
   * @param {number} x
   * @param {number} y
   * @param {number} id
   */
  constructor(id, habitacion, x, y) {
    super(id, habitacion, 'magia', x, y)
  }

  disparar() {
    this.habitacion.rayo(this.x + this.w / 2 - Rayo.ancho / 2, this.y + this.h / 2 - Rayo.ancho / 2)
  }
}

class Lucha extends Persona {
  /**
   * @param {Habitacion} habitacion
   * @param {number} x
   * @param {number} y
   * @param {number} id
   */
  constructor(id, habitacion, x, y) {
    super(id, habitacion, 'lucha', x, y)

  }

  disparar() {
    this.habitacion.espada(this, this.direccion)
  }

  centroEspada() {
    return { x: this.x + this.w / 2 - Espada.radioEspada / 2, y: this.y + this.h / 2 - Espada.radioEspada / 2 }
  }
}

class Pulsador extends EntidadAnimada {
  /**
   * @param {Habitacion} habitacion
   */
  constructor(habitacion, x = 0, y = 0) {
    super(habitacion, 'pulsador', x, y, Pulsador.anchoPulsador)
    this.pulsado = false
  }

  actualizar() {
    super.actualizar()

    if (!this.pulsado) {
      if (encontrar(this.habitacion.personas.values(), p => this.solapa(p))) {
        this.animar('pulsadorPulsado')
        this.pulsado = true
      }
    }
  }
}
Pulsador.tiempoMovimiento = 2000
Pulsador.anchoPulsador = 16

class AbridorPuertas extends Pulsador {
  pulsar() {
    this.habitacion.desbloquearPuertas()
  }
}

class GeneradorEnemigo extends Pulsador {
  pulsar() {
    this.habitacion.algunosFantasmasRandom(1, 2)
  }
}

class Dragon extends Enemigo {
  /**
   * @param {Habitacion} habitacion
   */
  constructor(habitacion) {
    super(habitacion, 'dragon', Habitacion.ancho / 2 - Dragon.largo / 2, Habitacion.alto / 2 - Dragon.ancho / 2, Dragon.largo, Dragon.ancho, Dragon.vida, 'dragonMuerto')
  }
}

Dragon.vida = 1 // 5 /* golpes */ * 3 /* personas */ * Persona.maximoNivel
Dragon.largo = 100 // 48 + 36 // ancho tope más 2 mitados ancho 2º tope
Dragon.ancho = 60 // floor(2 * 125 /* alto zona */ / 3)

class Arma extends EntidadAnimada {
  /**
   * @param {Habitacion} habitacion
   * @param {number} angulo
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {string} a
   */
  constructor(habitacion, a, x, y, w, h, angulo) {
    super(habitacion, a, x, y, w, h)
    this.angulo = angulo
    this.eliminada = false
    this.restante = Arma.tiempoDesvanecimiento
  }

  comprobarImpacto() {
    const impacto = encontrar(this.habitacion.enemigos.values(), e =>
      this.solapa(e)
    )
    if (impacto) {
      impacto.golpeado()
    }
    return impacto
  }

  actualizar() {
    super.actualizar()
    if (this.eliminada) {
      this.restante -= delta()
      if (this.restante <= 0) {
        this.habitacion.eliminarArma(this)
      }
    }
  }

  eliminar() {
    this.eliminada = true
  }
}

Arma.tiempoDesvanecimiento = 250

class Espada extends Arma {
  /**
   * @param {Habitacion} habitacion
   * @param {number} angulo
   * @param {Lucha} dueno
   */
  constructor(habitacion, angulo, dueno) {
    const { x, y } = dueno.centroEspada()
    super(habitacion, 'espada', x, y, Espada.radioEspada, Espada.radioEspada, angulo)
    this.tiempoEstocada = Espada.tiempoEstocada // TODO probablemente a atributo
    this.anguloReal = this.angulo
    this.dueno = dueno
  }

  dibujar() {
    const re2 = Espada.radioEspada / 2
    push()
    translate(this.x + re2, this.y + re2)
    rotate(this.anguloReal)
    imageMode(CENTER)
    super.dibujar(0, 0)
    pop()
  }

  actualizar() {
    super.actualizar()
    if (!this.eliminada) {
      const impacto = super.comprobarImpacto()
      if (this.tiempoEstocada < 0 || impacto !== undefined) {
        this.eliminar()
      } else {
        const { x, y } = this.dueno.centroEspada()

        this.anguloReal = this.angulo + TWO_PI * this.tiempoEstocada / Espada.tiempoEstocada
        this.x = x + Espada.radioEspada * cos(this.anguloReal)
        this.y = y + Espada.radioEspada * sin(this.anguloReal)
        this.tiempoEstocada -= delta()
      }
    }
  }
}

Espada.radioEspada = 12
Espada.tiempoEstocada = 1500

class Rayo extends Arma {
  /**
   * @param {Habitacion} h
   * @param {number} x
   * @param {number} y
   * @param {number} a
   */
  constructor(h, x, y, a) {
    super(h, 'rayo', x, y, Rayo.ancho, Rayo.ancho, a)
  }

  actualizar() {
    super.actualizar()
    if (!this.eliminada) {
      // TODO `v` en realidad es una constante porque `delta()` es
      // constante, pero así es más elegante
      const v = Rayo.velocidad / delta()
      this.x += v * cos(this.angulo)
      this.y += v * sin(this.angulo)

      const impacto = this.comprobarImpacto()
      if (impacto !== undefined ||
        this.x >= Habitacion.ancho ||
        this.x < 0 ||
        this.y >= Habitacion.alto || this.y < 0) {
        this.eliminar()
      }
    }
  }
}
Rayo.ancho = 6
Rayo.velocidad = 5

/**
 * @typedef {null | {entrando: boolean, porcentaje: number, cb: function(): void} } Transicion
*/
class Habitacion {
  bloquearPuertas() {
    for (const puerta of this.puertas.values()) {
      puerta.activa = false
      puerta.animar('puerta')
    }
  }

  desbloquearPuertas() {
    for (const puerta of this.puertas.values()) {
      puerta.animar('puertaAbriendose')
    }
  }

  limpiada() {

  }

  /**
   * @param {number} cuantos
   */
  fantasmasRandom(cuantos = 1) {
    for (let i = 0; i < cuantos; i++) {
      const { x, y } = Habitacion.posicionAleatoria()
      this.fantasma(x, y)
    }
  }

  /**
   * `max` y `min` tienen la misma semántica que `random` en `p5js`
   * @param {number} max
   * @param {any} min
   */
  algunosFantasmasRandom(max, min) {
    this.fantasmasRandom(random(max, min))
  }

  /** @return {Posicion} */
  static posicionAleatoria() {
    return { x: random(Habitacion.anchoMuro, Habitacion.ancho - Habitacion.anchoMuro), y: random(32 + Habitacion.anchoMuro, Habitacion.alto - Habitacion.anchoMuro) }
  }

  /**
   * @param {string} cadena
   */
  titulo(cadena) {
    this.anadirTexto(new Titulo(this, cadena))
  }

  /**
  * @param {string} cadena
  */
  subtitulo(cadena) {
    this.anadirTexto(new Subtitulo(this, cadena))
  }

  /**
   * @param {string} cadena
   */
  info(cadena) {
    this.anadirTexto(new Info(this, cadena))
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  abridorPuertas(x, y) {
    const a = new AbridorPuertas(this, x, y)
    this.pulsadores.add(a)
    this.anadir(a)
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  generadorEnemigo(x, y) {
    const g = new GeneradorEnemigo(this, x, y)
    this.pulsadores.add(g)
    this.anadir(g)
  }

  /**
   * @param {Enemigo} enemigo
   */
  eliminarEnemigo(enemigo) {
    this.enemigos.delete(enemigo)
    this.eliminar(enemigo)
  }

  /**
   * @param {Arma} arma
   */
  eliminarArma(arma) {
    this.eliminar(arma)
    this.armas.delete(arma)
  }

  /**

   * @param {Entidad} entidad
   */
  eliminar(entidad) {
    this.entidades.delete(entidad)
  }

  /**
   * @param {Persona} persona
   */
  eliminarPersona(persona) {
    this.eliminar(persona)
    this.personas.delete(persona)
  }

  /**
   * @param {Arma} arma
   */
  anadirArma(arma) {
    this.anadir(arma)
    this.armas.add(arma)
  }

  /**
   * @param {Lucha} dueno
   * @param {number} angulo
   */
  espada(dueno, angulo) {
    this.anadirArma(new Espada(this, angulo, dueno))
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  rayo(x, y) {
    for (const angulo of [0, HALF_PI, PI, 1.5 * PI]) {
      this.anadirArma(new Rayo(this, x, y, angulo))
    }
  }

  /**
   * @param {TipoPuertaConcreta} lado
   */
  puerta(lado) {
    // eslint-disable-next-line new-cap
    const puerta = new lado(this)
    this.anadir(puerta)
    this.puertas.add(puerta)
  }


  /**
   * @param {TipoPuertaConcreta[]} puertas
   * @param {number} quedan
   * @param {Set<Persona>} personas
   */
  constructor(personas, quedan, ...puertas) {
    for (const persona of personas) {
      persona.habitacion = this
    }
    /** @type {Set<Persona>} */ this.personas = personas
    /** @type {Set<Arma>} */ this.armas = new Set()
    /** @type {Set<Enemigo>} */ this.enemigos = new Set()
    /** @type {Set<Entidad>} */ this.entidades = new Set(this.personas)
    /** @type {Set<Pulsador>} */ this.pulsadores = new Set()

    /** @type {Set<PuertaConcreta>} */ this.puertas = new Set()
    /** @type {Set<Texto>} */ this.textos = new Set()


    for (const p of puertas) {
      this.puerta(p)
    }

    this.habitacionesDesdeMajemag = 0

    /** @type {Transicion} */ this.transicion = null

    this.quedanParaLucha = quedan
  }

  elegirHabitacion() {
    return (this.quedanParaLucha < 0 && random() > 0.5) ? LuchaFinal : random(Habitacion.habitacionesMedio)
  }

  /** @param {typeof Puerta} desde */
  siguiente(desde) {
    this.transicion = {
      entrando: false, porcentaje: 0, cb: () => {
        Habitacion.habitacionActual = new (this.elegirHabitacion())(Habitacion.habitacionActual.personas, this.quedanParaLucha, desde)
        Habitacion.habitacionActual.transicion = {
          entrando: true, porcentaje: 0, cb: () => {
            Habitacion.habitacionActual.transicion = null
          }
        }
        Habitacion.habitacionActual.actualizar(this.blobs)
      }
    }
  }

  /** @param {BlobCamara[]} blobs */
  actualizar(blobs) {


    if (this.transicion) {
      this.transicion.porcentaje += delta()
      if (this.transicion.porcentaje >= Habitacion.tiempoTransicion) {
        this.transicion.cb()
      }
    }
    else {
      this.blobs = blobs

      for (const entidad of this.entidades.values()) {
        entidad.actualizar()
      }
      for (const blob of blobs) {
        if (!blob.asignado) {
          this.persona(new (random([Magia, Lucha]))(blob.id, this, blob.x, blob.y))
        }
      }
    }
  }

  /**
   * @param {number} p
   */
  transicionFade(p) {
    const maxAlpha = 255
    const valor = maxAlpha * p
    noStroke()
    fill(0, 0, 0, (this.transicion.entrando ? maxAlpha - valor : valor))
    rect(0, 0, Habitacion.ancho, Habitacion.alto)
  }

  /**
   * @param {number} p
   */
  transicionPixel(p) {
    stroke('black')
    fill('black')
    const a = 6
    function bigger(a, b) { return a > b }
    function smaller(a, b) { return a <= b }
    const c = this.transicion.entrando ? bigger : smaller
    for (let x = 0; x < Habitacion.ancho; x += a) {
      for (let y = 0; y < Habitacion.alto; y += a) {
        if (c(random(), p)) {
          rect(x, y, a, a)
        }
      }
    }

  }


  dibujar() {
    image(imagenes.plaza, 0, 0)
    for (const puerta of this.puertas.values()) {
      puerta.dibujar()
    }
    for (const pulsador of this.pulsadores.values()) {
      pulsador.dibujar()
    }
    for (const enemigo of this.enemigos.values()) {
      enemigo.dibujar()
    }
    for (const arma of this.armas.values()) {
      arma.dibujar()
    }
    for (const persona of this.personas.values()) {
      persona.dibujar()
    }
    if (this.transicion) {
      this.transicionPixel(this.transicion.porcentaje / Habitacion.tiempoTransicion)
    }
    // Para que salgan siempre encima
    for (const texto of this.textos.values()) {
      texto.dibujar()
    }
  }

  dragon() {
    this.enemigo(new Dragon(this))
  }

  /**
   * @param {Enemigo} tipo
   */
  enemigo(tipo) {
    this.anadir(tipo)
    this.enemigos.add(tipo)
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  fantasma(x, y) {
    this.enemigo(new Fantasma(this, x, y))
  }

  /**
   * Añade un elemento nuevo a la lista de entidades.
   * @param {Entidad} entidad
   */
  anadir(entidad) {
    this.entidades.add(entidad)
  }

  /**
   * @param {Texto} entidad
   */
  anadirTexto(entidad) {
    this.textos.add(entidad)
  }

  /**
   * @param {Persona} persona
   */
  persona(persona) {
    this.anadir(persona)
    this.personas.add(persona)
  }

  /**
   * @param {TipoPuertaConcreta} desde
   */
  static subconjuntoMenos(desde) {
    let candidatos = Habitacion.puertas.filter(p => p !== desde)
    const total = ceil(random(1, candidatos.length))
    const ret = []
    for (let i = 0; i < total; i++) {
      const cual = random(candidatos)
      candidatos = candidatos.filter(p => p !== cual)
      ret.push(cual)
    }
    return ret
  }
}

Habitacion.tipoLetra = undefined
Habitacion.minimasHastaLucha = 6
Habitacion.anchoMuro = 10
Habitacion.ancho = 192
Habitacion.alto = 157
Puerta.lateral = 29.5 + ((Habitacion.alto - 32) / 2 - Puerta.altoPuerta / 2)
/** @type {Habitacion} */
Habitacion.habitacionActual = null
Habitacion.tiempoTransicion = 500
Habitacion.puertas = [Izquierda, Derecha, Arriba]

class LuchaFinal extends Habitacion {
  /**
   * @param {Set<Persona>} [personas]
   */
  constructor(personas) {
    super(personas, Habitacion.minimasHastaLucha, Arriba)
    this.bloquearPuertas()
    this.dragon()
    this.quedanParaLucha = Habitacion.minimasHastaLucha
  }

  limpiada() {
    this.desbloquearPuertas()
    this.titulo('¡Has derrotado a Majemag!')
    this.subtitulo('Dedícaselo a [@nombre] con')
    this.info('@informaticaucm #GGJ20Madrid #GGJ20')
  }
}

class PulsadorFantasma extends Habitacion {
  /**
   * @param {number} quedan
   * @param {TipoPuertaConcreta} desde
   * @param {Set<Persona>} personas
   */
  constructor(personas, quedan, desde) {
    super(personas, quedan - 1, ...Habitacion.subconjuntoMenos(desde))
    this.generadorEnemigo(Habitacion.ancho / 2 - Pulsador.anchoPulsador / 2, 50)
  }
}

class FantasmasLimpieza extends Habitacion {
  /**
    * @param {TipoPuertaConcreta} desde
    * @param {Set<Persona>} personas 
     */
  constructor(personas, quedan, desde) {
    super(personas, quedan - 1, ...Habitacion.subconjuntoMenos(desde))
    this.bloquearPuertas()
    this.algunosFantasmasRandom(1, 3)
  }

  limpiada() {
    this.desbloquearPuertas()
  }
}

class FantasmasBloqueo extends Habitacion {
  /**
   * @param {TipoPuertaConcreta} desde
   * @param {number} quedan
   * @param {Set<Persona>} personas
   */
  constructor(personas, quedan, desde) {
    super(personas, quedan - 1, ...Habitacion.subconjuntoMenos(desde))
    this.bloquearPuertas()
    this.abridorPuertas(Habitacion.ancho / 2 - Pulsador.anchoPulsador / 2, 100)
    this.algunosFantasmasRandom(1, 2)
  }
}

/** @type {typeof Habitacion[]} */
Habitacion.habitacionesMedio = [PulsadorFantasma, FantasmasBloqueo, FantasmasLimpieza]

// eslint-disable-next-line no-unused-vars
function setup() {

  // TODO ¿se podrá usar WEBGL de 3er parámetro?
  createCanvas(Habitacion.ancho, Habitacion.alto)
  noSmooth()
  textAlign(CENTER, CENTER)
  textFont(Habitacion.tipoLetra)

  Texto.tamano = textAscent() + textDescent()

  // @ts-ignore
  api.tracking.connect()

  // Habitacion.habitacionActual = new (random(Habitacion.habitacionesMedio))(10) //  new LuchaFinal()
  Habitacion.habitacionActual = new LuchaFinal(new Set())
}

const imagenes = {}
const animaciones = {}

/**
 * @param {number} final
 * @param {number} inicio
 * @return {number[]}
 */
function rango(final, inicio = 0) {
  return [...Array(final).keys()].slice(inicio)
}

/**
 * @param {string} nombre
 * @param {number} ultimo
 * @return {string[]}
 */
function f(nombre, ultimo, primero = 0) {
  return rango(ultimo, primero).map(i => `${nombre}.ani.${i.toString().padStart(4, '0')}`)
}

// eslint-disable-next-line no-unused-vars
function preload() {
  const url = 'media/user621461af90'

  Habitacion.tipoLetra = loadFont(`${url}/tipoletra.ttf`)
  /**
   * @param {Enemigo} p
   */
  function eliminaEnemigo(p) {
    p.habitacion.eliminarEnemigo(p)

    if (p.habitacion.enemigos.size <= 0) {
      p.habitacion.limpiada()
    }
  }

  animaciones.lucha = { fotogramas: ['lucha.img'], periodo: 500, vuelta: true }
  animaciones.fantasma = { fotogramas: ['fantasma.img'] }
  animaciones.fantasmaMuerto = {
    fotogramas: ['fantasma.img', 'fantasma.img'],
    periodo: 500,
    terminada: eliminaEnemigo
  }

  animaciones.dragonMuerto = {
    fotogramas: ['dragon.img', 'dragon.img'],
    periodo: 500,
    terminada: eliminaEnemigo
  }



  animaciones.magia = { fotogramas: ['magia.img'], periodo: 450, vuelta: true }
  animaciones.puertaAbriendose = { fotogramas: f('puerta', 13), periodo: 250, terminada: p => { p.activa = true } }
  animaciones.espada = { fotogramas: ['hacha.img'] }
  animaciones.rayo = { fotogramas: f('rayo', 2), periodo: 125, vuelta: true }
  animaciones.pulsador = { fotogramas: ['palanca.ani.0000'] }
  animaciones.pulsadorPulsado = { fotogramas: f('palanca', 7), periodo: 200, terminada: p => p.pulsar() }

  animaciones.puerta = { fotogramas: ['puerta.ani.0000'] }
  animaciones.puertaAbierta = { fotogramas: ['puerta.ani.0012'] }

  animaciones.dragon = { fotogramas: ['dragon.img'] }

  const pngs = Object.keys(animaciones).flatMap(k => animaciones[k].fotogramas)
  for (const png of pngs) {
    imagenes[png] = loadImage(`${url}/${png}.png`)
  }
  imagenes.plaza = loadImage(`${url}/plaza.img.png`)
}

// eslint-disable-next-line no-unused-vars
function draw() {
  // La división en otra función es para reutilizar el proxy sin cambios
  pintarHabitacion()
}

function pintarHabitacion() {
  Habitacion.habitacionActual.actualizar(
    // @ts-ignore
    api.tracking.getBlobs()
  )
  Habitacion.habitacionActual.dibujar()
}
