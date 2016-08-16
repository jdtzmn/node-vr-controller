const spawn = require('child_process').spawn
const path = require('path')
const defaults = {
  width: 576,
  height: 324,
  args: [
    '-f', 'image2', '-vcodec', 'mjpeg', '-b:v', '500k', '-r', '21', '-q:v', '10'
  ]
}

const stream = function (os, output, height = defaults.height, width = defaults.width, args = defaults.args, cb) {
  if (!os || !output) {
    return new Error('os and output parameters are required')
  }

  if (typeof args === 'function') {
    cb = args
    args = undefined
  } else if (typeof height === 'function') {
    cb = height
    width = defaults.width
    height = defaults.height
  }

  let file = './node_modules/ffmpeg/ffmpeg'

  switch (os) {
    case 'darwin':
      args = ['-f', 'avfoundation', '-i', '1'].concat(args)
      break
    case 'win32':
      args = ['-f', 'gdigrab', '-i', 'desktop'].concat(args)
      file = './node_modules/ffmpeg/ffmpeg.exe'
      break
  }

  args = args.concat(['-s', width + 'x' + height, output])

  let ffmpeg = spawn(file, args)

  ffmpeg.stderr.on('data', (err) => {
    if (cb) cb(err.toString())
  })

  ffmpeg.stdout.on('data', (output) => {
    if (cb) cb(output.toString())
  })
}

module.exports = stream
