const execFile = require('child_process').execFile
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
    cb = args
    width = defaults.width
    height = defaults.height
  }

  switch (os) {
    case 'darwin':
      args = ['-f', 'avfoundation', '-i', '1'].concat(args)
      break
    case 'win32':
      args = ['-f', 'dshow', '-i', 'video="screen-capture-recorder"'].concat(args)
      break
  }

  args = args.concat(['-s', width + 'x' + height, output])

  execFile('./node_modules/.bin/ffmpeg', args, (err, stdout, stderr) => {
    if (err) return console.error(err)
    if (cb) cb(err, stdout, stderr)
  })
}

module.exports = stream
