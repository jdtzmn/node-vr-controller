const spawn = require('child_process').spawn
const defaults = {
  width: 1000,
  height: 562,
  args: [
    '-f', 'mpegts', '-vcodec', 'mpeg1video', '-b:v', '1000k', '-bf', '0'
  ]
}

const stream = function (os, output, height = defaults.height, width = defaults.width, args = defaults.args, simulatevr, monitor = 1, cb) {
  if (!os || !output) {
    return new Error('os and output parameters are required')
  }

  if (typeof height === 'function') {
    cb = height
    width = defaults.width
    height = defaults.height
  }

  let file = './ffmpeg/ffmpeg'

  if (simulatevr) {
    args = ['-vf', '[0]lenscorrection=0.5:0.5:0.1:0.1[x]; [x]split[l][r]; [l][r]hstack'].concat(args)
  } else {
    args = args.concat(['-vf', 'scale=trunc(oh*a/2)*2:ih'])
  }

  switch (os) {
    case 'darwin':
      args = ['-f', 'avfoundation', '-capture_cursor', '1', '-r', '60', '-i', monitor].concat(args)
      break
    case 'win32':
      args = ['-f', 'gdigrab', '-i', 'desktop'].concat(args)
      file = './ffmpeg/ffmpeg.exe'
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
