const { src, dest, series, watch, parallel } = require('gulp')
const changed = require('gulp-changed')
const exec = require('gulp-exec')
const fs = require('fs')

const krita = '/Applications/krita.app/Contents/MacOS/krita --nosplash'
const docs = './media/user621461af90/'
const inext = 'kra'
const outext = 'png'
const animated = `*.ani.${inext}`
const images = `*.img.${inext}`

function animadas() {
  return src(animated)
    .pipe(changed(docs, { extension: `.0000.${outext}` }))
    .pipe(exec(`${krita} --export-sequence --export-filename ${docs}<%= file.stem %>..${outext} <%= file.relative %>`))
}

function imagenes() {
  return src(images)
    .pipe(changed(docs, { extension: `.${outext}` }))
    .pipe(exec(`${krita} --export --export-filename ${docs}<%= file.stem %>.${outext} <%= file.relative %>`))
}

function mediaDir(cb) {
  fs.mkdir(docs, { recursive: true }, cb);
}

exports.default = series(mediaDir, parallel(imagenes, animadas))

exports.watch = series(exports.default, function () {
  watch([animated, images], exports.default)
})