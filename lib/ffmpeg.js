const execFile = require('child_process').exec
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

  execFile('../node_modules/ffmpeg/ffmpeg ' + args.join(' '), (err, stdout, stderr) => {
    if (err) return console.error(err)
    if (cb) cb(err, stdout, stderr)
  })
}

stream('darwin', 'http://localhost:3000/pass123/576/324/image-%3d.jpg', (err, stdout, stderr) => {
  if (err) return console.log(err)
  if (stdout) console.log(stdout)
  if (stderr) console.error(stderr)
})

module.exports = stream
