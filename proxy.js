const released = -1
let overBox = released

function mousePressed() {
  overBox = released
  api.tracking.getBlobs().forEach(blob => {
    if (dist(mouseX, mouseY, blob.x, blob.y) < Persona.tamanoPersona) {
      overBox = blob.id
    }
  })

  if (overBox === released) {
    api.tracking.blobs.push({ id: api.tracking.blobs.length, x: mouseX, y: mouseY })
  }
}

function mouseDragged() {
  if (overBox > released) {
    const found = api.tracking.blobs.find(blob =>
      blob.id === overBox)
    if (found) {
      found.x = mouseX
      found.y = mouseY
    }
  }
}

function mouseReleased() {
  overBox = released
}


// polyfill que se ha inventado vilmente Carlos para sustituir a la API de Medialab-Prado
// WARNING: he mirado ejemplos de código y me he imaginado como funciona: **muy peligroso!**
const api = {
  warehouse: new Map(),
  storage: {
    get: /** @param {any} key */
      function (key) {
        return api.warehouse.get(key)
      },
    set: /**
     * @param {any} key
     * @param {any} value
     */
      function (key, value) {
        api.warehouse.set(key, value)
      }
  },
  tracking: {
    connect: function () { },
    getBlobs: function () {
      return JSON.parse(JSON.stringify(api.tracking.blobs))
    },
    blobs: []
  },
  project: {
    /** @param {any} cb */
    onAboutToStop(cb) {
      api.project.stopCallback = cb
    },
    stopCallback: null
  },
  // usar esta función para lanzar el evento (desde la consola: `api.event()`)
  event: function () {
    api.project.stopCallback()
  }
}

api.tracking.blobs.push({ id: api.tracking.blobs.length, x: 50, y: 110 })


function draw() {
  background(0, 0, 0)

  pintarHabitacion()

  noStroke()
  fill(255, 255, 255)
  rect(0, 0, 72, 16)
  rect(0, 16, 36, 16)
  rect(120, 0, 72, 16)
  rect(156, 16, 36, 16)

  noFill()
  stroke('green')
  for (const entidad of Habitacion.habitacionActual.entidades.values()) {
    // rect(entidad.x, entidad.y, entidad.w, entidad.h)
  }

}