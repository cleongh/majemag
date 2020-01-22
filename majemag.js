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

// /** @param {function(): void} f */
// function operar(f) {
//   push()
//   f()
//   pop()
// }

// /** @param {function(): void} f */
// function espejoX(f) {
//   escalar(-1, 1, f)
// }

// /**
//  * @param {number[][]} vertices
//  */
// function poligono(vertices) {
//   beginShape()
//   for (const v of vertices) {
//     vertex(
//       // @ts-ignore
//       ...v
//     )
//   }
//   endShape()
// }

// /**
//  * @param {function(): void} f
//  * @param {number} x
//  * @param {number} y
//  */
// function trasladar(x, y, f) {
//   operar(() => {
//     translate(x, y)
//     f()
//   })
// }

// /** @param {function(): void} f
//  *  @param {number} x
//  * @param {number} y
//  */

// function escalar(x, y = x, f) {
//   operar(() => {
//     scale(x, y)
//     f()
//   })
// }

// /**
//  * @param {number} s
//  * @param {function(): void} f
//  */
// // function escalarIgual(s, f) {
// //   escalar(s, s, f)
// // }

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

// /**
//  * @template T
//  * @param {T[]} iterador
//  * @param {function(T): boolean} condicion
//  */
// function alguno(iterador, condicion) {
//   for (const elemento of iterador) {
//     if (condicion(elemento)) return true
//   }
//   return false
// }

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
    // /** @type {Interpolacion[]} */
    // this.interpolaciones = []
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

  // /**
  //  * @param {string} atributo
  //  * @param {number} valorFinal
  //  * @param {number} tiempo
  //  * @param {function(): void} cb
  //  */
  // interpolar(atributo, valorFinal, tiempo, cb) {
  //   this.interpolaciones.push(new Interpolacion(this, atributo, valorFinal, tiempo, cb))
  //   this.actualizarInterpolacion()
  // }

  // actualizarInterpolacion() {
  //   for (const interpolacion of this.interpolaciones) {
  //     interpolacion.actualizar()
  //   }

  //   this.interpolaciones = this.interpolaciones.filter(
  //     /** @param {Interpolacion} i */
  //     i => !i.terminada)
  // }

  // Para que TS no proteste, igual hay una manera mejor
  dibujar() { }

  // actualizar() {
  //   this.actualizarInterpolacion()
  // }

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

    // if (l > 1 && (this.animacion.vuelta || this.fotograma < l - 1)) {
    this.tiempoAnimacion += delta()
    if (this.tiempoAnimacion >= this.animacion.periodo) {
      // this.fotograma++
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
    super(habitacion, 0, y, Habitacion.ancho, Texto.alto)
    this.cadena = cadena
  }

  dibujar() {
    text(this.cadena, this.x, this.y, this.w, this.h)
  }
}

class Titulo extends Texto {
  /**
   * @param {Habitacion} h
   * @param {string} c
   */
  constructor(h, c) {
    super(h, c, Habitacion.alto - Texto.alto * 2 - 5)
  }

  dibujar() {
    fill('red')

    super.dibujar()
  }
}

class Info extends Texto {
  /**
   * @param {Habitacion} h
   * @param {string} c
   */
  constructor(h, c) {
    super(h, c, Habitacion.alto - Texto.alto - 5)
  }

  dibujar() {
    fill('white')

    super.dibujar()
  }
}

Texto.alto = 20

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

  // dibujar(x = this.x, y = this.y) {
  //   if (!this.activa) {
  //     super.dibujar(x, y)
  //   }
  // }

  actualizar() {
    super.actualizar()
    if (this.activa) {
      this.tiempoSalida =
        encontrar(this.habitacion.personas.values(), p => p.solapa(this))
          ? this.tiempoSalida - delta()
          : Puerta.maxTiempoSalida

      if (this.tiempoSalida <= 0) {
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
Puerta.maxTiempoSalida = 500

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
  // dibujar() {
  //   if (this.direccion > HALF_PI && this.direccion <= 1.5 * PI) {
  //     push()
  //     translate(this.x + this.w, this.y)
  //     scale(-1, 1)
  //     // FIXME
  //     image(this.imagen, 0, 0)
  //     pop()
  //   } else {
  //     super.dibujar()
  //   }
  // }

  /**
   * @param {Habitacion} habitacion
   * @param {number} x
   * @param {number} y
   * @param {string} animacion
   */
  constructor(habitacion, animacion, x, y) {
    super(habitacion, animacion, x, y, Persona.tamanoPersona)
    // this.nivel = 1
    this.tiempoDisparo = random(this.maxTiempoDisparo())
    this.direccion = random(TWO_PI)
  }

  /** @param {BlobCamara} blob */
  equivalenteA(blob) {
    return dist(blob.x, blob.y, this.x, this.y) < Persona.distanciaReconocimento
  }

  maxTiempoDisparo() {
    return 3000 // / this.nivel
  }

  actualizar() {
    super.actualizar()
    this.sincronizarConBlobs()

    if (this.habitacion.enemigos.size > 0) {
      this.tiempoDisparo += delta()

      if (this.tiempoDisparo >= this.maxTiempoDisparo()) {
        // @ts-ignore
        this.disparar()
        this.tiempoDisparo = 0
      }
    }
  }

  sincronizarConBlobs() {
    const blob = this.habitacion.blobs.find(blob => this.equivalenteA(blob))
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
}

Persona.maximoNivel = 3
Persona.tamanoPersona = tamanoSprite
Persona.distanciaReconocimento = 10

class Magia extends Persona {
  /**
 * @param {Habitacion} habitacion
 * @param {number} x
 * @param {number} y
 */
  constructor(habitacion, x, y) {
    super(habitacion, 'magia', x, y)
  }

  disparar() {
    this.habitacion.rayo(this.x + this.w / 2 - Rayo.ancho / 2, this.y + this.h / 2 - Rayo.ancho / 2)
  }

  // dibujar() {
  //   super.dibujarPersona(imagenes.magia)
  // }
}

class Lucha extends Persona {
  /**
   * @param {Habitacion} habitacion
   * @param {number} x
   * @param {number} y
   */
  constructor(habitacion, x, y) {
    super(habitacion, 'lucha', x, y)
  }

  // dibujar() {
  //   super.dibujarPersona(this.imagen)
  // }

  disparar() {
    this.habitacion.espada(this, this.direccion)
  }

  centroEspada() {
    return { x: this.x + this.w / 2 - Espada.radioEspada / 2, y: this.y + this.h / 2 - Espada.radioEspada / 2 }
  }
}

/**
 * API inspirada en Phaser
 */
// class Interpolacion {
//   /**
//    * @param {Entidad} objeto
//    * @param {string} atributo
//    * @param {number} final
//    * @param {number} tiempo
//    * @param {function(): void} cb
//    */
//   constructor(objeto, atributo, final, tiempo, cb) {
//     this.objeto = objeto
//     this.atributo = atributo
//     this.final = final
//     this.inicial = this.objeto[this.atributo]
//     this.tiempoFinal = tiempo
//     this.cb = cb
//     this.terminada = false
//     this.tiempoTranscurrido = 0
//   }

//   /**
//    * Esta es la función que hay que modificar para diferentes tipos
//    * de interpolación
//    * @param {number} porcentaje El porcentaje de tiempo total que lleva
//    */
//   interpolar(porcentaje) {
//     this.objeto[this.atributo] = this.inicial + (this.final - this.inicial) * porcentaje
//   }

//   actualizar() {
//     this.interpolar(this.tiempoTranscurrido / this.tiempoFinal)
//     this.tiempoTranscurrido += delta()
//     this.terminada = this.tiempoTranscurrido >= this.tiempoFinal
//     if (this.terminada) {
//       this.cb()
//     }
//   }
// }

class Pulsador extends EntidadAnimada {
  /**
   * @param {Habitacion} habitacion
   */
  constructor(habitacion, x = 0, y = 0) {
    super(habitacion, 'pulsador', x, y, Pulsador.anchoPulsador)
    this.pulsado = false
  }

  // dibujar() {
  //   // fill(lerpColor(paleta[3], paleta[4], this.pulsado))
  //   // noStroke()
  //   // rect(this.x, this.y, Pulsador.anchoPulsador, Pulsador.anchoPulsador)
  //   image(imagenes.palanca, this.x, this.y)
  // }

  actualizar() {
    super.actualizar()

    if (!this.pulsado) {
      if (encontrar(this.habitacion.personas.values(), p => this.solapa(p))) {
        this.animar('pulsadorPulsado')
        this.pulsado = true
        // this.interpolar('pulsado', 1, Pulsador.tiempoMovimiento, () =>
        //   // @ts-ignore
        //   this.pulsar()
        // )
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
    // this.cabeza = 0
  }

  // actualizar() {
  //   this.cabeza += delta() * 0.0015
  // }

  // dibujar() {
  //   // rect(this.x, this.y, Dragon.largo, Dragon.ancho)
  //   image(imagenes.dragon, this.x, this.y)
  //   // return
  //   // trasladar(this.x, this.y, () => {
  //   //   noFill()
  //   //   stroke(paleta[4])
  //   //   strokeWeight(0.1)
  //   //   escalarIgual(12, () => {
  //   //     ellipse(0, 0, 3, 1)

  //   //     trasladar(-1, -0.5, () => {
  //   //       let xCabeza = sin(this.cabeza)
  //   //       let yCabeza = cos(this.cabeza * 1.4)
  //   //       trasladar(xCabeza, yCabeza, () => {
  //   //         triangle(-0.5, 0, 0.5, 0, 0.5, 1.5)
  //   //         const cuerno = () => {
  //   //           line(-0.4, 0, -0.75, -0.3)
  //   //           line(-0.75, -0.3, -0.5, -0.6)
  //   //         }
  //   //         cuerno()
  //   //         espejoX(cuerno)
  //   //       })
  //   //       const uno = 0.25
  //   //       const dos = uno * 2
  //   //       const tres = uno * 3
  //   //       ellipse(xCabeza * uno, yCabeza * uno, 0.6)
  //   //       ellipse(xCabeza * dos, yCabeza * dos, 0.4)
  //   //       ellipse(xCabeza * tres, yCabeza * tres, 0.2)
  //   //     })

  //   //     function pierna() {
  //   //       rect(0, 0, 0.3, 1)
  //   //     }
  //   //     trasladar(-1.5, 0, pierna)
  //   //     trasladar(-1, 0, pierna)
  //   //     trasladar(1.5, 0, pierna)
  //   //     trasladar(1, 0, pierna)
  //   //   })
  //   // })
  // }
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
}

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
    const impacto = super.comprobarImpacto()
    if (this.tiempoEstocada < 0 || impacto !== undefined) {
      this.habitacion.eliminarArma(this)
    } else {
      const { x, y } = this.dueno.centroEspada()

      this.anguloReal = this.angulo + TWO_PI * this.tiempoEstocada / Espada.tiempoEstocada
      this.x = x + Espada.radioEspada * cos(this.anguloReal)
      this.y = y + Espada.radioEspada * sin(this.anguloReal)
      this.tiempoEstocada -= delta()
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
  constructor(h,x,y,a) {
    super(h, 'rayo', x, y, Rayo.ancho, Rayo.ancho, a)
  }

  actualizar() {
    super.actualizar()
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
      this.habitacion.eliminarArma(this)
    }
  }
}
Rayo.ancho = 6
Rayo.velocidad = 5

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
    this.anadir(new Titulo(this, cadena))
  }

  /**
   * @param {string} cadena
   */
  info(cadena) {
    this.anadir(new Info(this, cadena))
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  abridorPuertas(x, y) {
    this.anadir(new AbridorPuertas(this, x, y))
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  generadorEnemigo(x, y) {
    this.anadir(new GeneradorEnemigo(this, x, y))
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

  /** @param {TipoPuertaConcreta[]} puertas */
  constructor(...puertas) {
    /** @type {Set<Persona>} */ this.personas = new Set()
    /** @type {Set<Arma>} */ this.armas = new Set()
    /** @type {Set<Enemigo>} */ this.enemigos = new Set()
    /** @type {Set<Entidad>} */ this.entidades = new Set()
    /** @type {Set<PuertaConcreta>} */ this.puertas = new Set()

    for (const p of puertas) {
      this.puerta(p)
    }

    this.habitacionesDesdeMajemag = 0
  }

  elegirHabitacion() {
    return random([Pasillo, Esquina, Distribuidor, LuchaFinal, PulsadorFantasma, FantasmasBloqueo,
      FantasmasLimpieza])
  }

  /** @param {typeof Puerta} desde */
  siguiente(desde) {
    Habitacion.habitacionActual = new (this.elegirHabitacion())(desde)
    Habitacion.habitacionActual.actualizar(this.blobs)
  }

  /** @param {BlobCamara[]} blobs */
  actualizar(blobs) {
    this.blobs = blobs

    for (const entidad of this.entidades.values()) {
      entidad.actualizar()
    }
    for (const blob of blobs) {
      if (!blob.asignado) {
        this.persona(new (random([Magia, Lucha]))(this, blob.x, blob.y))
      }
    }
  }

  dibujar() {
    image(imagenes.plaza, 0, 0)
    for (const entidad of this.entidades.values()) {
      entidad.dibujar()
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
   * @param {Persona} persona
   */
  persona(persona) {
    this.anadir(persona)
    // const p = this.anadir(i => persona(i))
    this.personas.add(persona)
  }
}
Habitacion.anchoMuro = 10
Habitacion.ancho = 192
Habitacion.alto = 157
Puerta.lateral = 29.5 + ((Habitacion.alto - 32) / 2 - Puerta.altoPuerta / 2)
/** @type {Habitacion} */
Habitacion.habitacionActual = null

// eslint-disable-next-line no-unused-vars
class Salida extends Habitacion {
  constructor() {
    super(Izquierda, Derecha, Arriba)
    this.fantasmasRandom()
  }
}

class LuchaFinal extends Habitacion {
  constructor() {
    super(Arriba)

    this.bloquearPuertas()

    this.dragon()
  }

  limpiada() {
    this.desbloquearPuertas()
    this.titulo('#majemag')
    this.info('Tuitea para reconocer a un compañero')
  }
}

class Pasillo extends Habitacion {
}

class Esquina extends Habitacion {
  /** @param {typeof Puerta} desde */
  constructor(desde) {
    switch (desde) {
      case Izquierda:
        super(Arriba)
        break
      case Derecha:
        super(Arriba)
        break
      default:
        super(random([Izquierda, Derecha]))
        break
    }
  }
}

class Distribuidor extends Habitacion {
  constructor() {
    super(Izquierda, Derecha, Arriba)
  }
}

class PulsadorFantasma extends Habitacion {
  constructor() {
    super(Izquierda, Derecha)
    this.generadorEnemigo(Habitacion.ancho / 2 - Pulsador.anchoPulsador / 2, 50)
  }
}

class FantasmasLimpieza extends Esquina {
  /**
     * @param {TipoPuertaConcreta} desde
     */
  constructor(desde) {
    super(desde)
    this.bloquearPuertas()
    this.algunosFantasmasRandom(1, 3)
  }

  limpiada() {
    this.desbloquearPuertas()
  }
}

class FantasmasBloqueo extends Pasillo {
  /**
     * @param {TipoPuertaConcreta} desde
     */
  constructor(desde) {
    super(desde)
    this.bloquearPuertas()
    this.abridorPuertas(Habitacion.ancho / 2 - Pulsador.anchoPulsador / 2, 100)
    this.algunosFantasmasRandom(1, 2)
  }
}

// eslint-disable-next-line no-unused-vars
function setup() {
  // TODO ¿se podrá usar WEBGL de 3er parámetro?
  createCanvas(Habitacion.ancho, Habitacion.alto)
  noSmooth()
  textAlign(CENTER, CENTER)

  // @ts-ignore
  api.tracking.connect()

  // Habitacion.habitacionActual = new PulsadorFantasma()
  Habitacion.habitacionActual = new LuchaFinal()
}

// FIXME busca solución a la paleta
// const cga1 = [[0, 0, 0], [236, 104, 248], [136, 252, 254], [255, 255, 255]]
// let paleta
const imagenes = {}
const animaciones = {}

// eslint-disable-next-line no-unused-vars
function preload() {
  const url = 'media/user621461af90'

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
  animaciones.puertaAbriendose = { fotogramas: ['puerta.ani.0000', 'puerta.ani.0001', 'puerta.ani.0002', 'puerta.ani.0003', 'puerta.ani.0004', 'puerta.ani.0005', 'puerta.ani.0006', 'puerta.ani.0007', 'puerta.ani.0008', 'puerta.ani.0009', 'puerta.ani.0010'], periodo: 250, terminada: p => { p.activa = true } }
  animaciones.espada = { fotogramas: ['hacha.img'] }
  animaciones.rayo = { fotogramas: ['rayo.ani.0000', 'rayo.ani.0001'], periodo: 125, vuelta: true }
  animaciones.pulsador = { fotogramas: ['palanca.ani.0000'] }
  animaciones.pulsadorPulsado = { fotogramas: ['palanca.ani.0000', 'palanca.ani.0001', 'palanca.ani.0002', 'palanca.ani.0003', 'palanca.ani.0004', 'palanca.ani.0005', 'palanca.ani.0006'], periodo: 200, terminada: p => p.pulsar() }

  animaciones.puerta = { fotogramas: ['puerta.ani.0000'] }
  animaciones.puertaAbierta = { fotogramas: ['puerta.ani.0010'] }

  animaciones.dragon = { fotogramas: ['dragon.img'] }

  // const pngs = ['lucha', 'magia', 'plaza', 'puerta', 'fantasma', 'dragon', 'palanca', 'rayo', 'espada']
  const pngs = Object.keys(animaciones).flatMap(k => animaciones[k].fotogramas)
  for (const png of pngs) {
    imagenes[png] = loadImage(`${url}/${png}.png`)
  }
  imagenes.plaza = loadImage(`${url}/plaza.img.png`)
}

// eslint-disable-next-line no-unused-vars
function draw() {
  // background(paleta[0])

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
