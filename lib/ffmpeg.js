const spawn = require('child_process').spawn
const defaults = {
  width: 1000,
  height: 562,
  args: [
    '-f', 'mpeg1video', '-r', '24', '-b:v', '1000k'
  ]
}

const stream = function (os, output, height = defaults.height, width = defaults.width, args = defaults.args, simulatevr = false, cb) {
  if (!os || !output) {
    return new Error('os and output parameters are required')
  }

  if (typeof simulatevr === 'function' && typeof args === 'boolean') {
    cb = simulatevr
    simulatevr = args
    args = defaults.args
  } else if (typeof simulatevr === 'function' && typeof args !== 'boolean') {
    cb = simulatevr
    simulatevr = false
  } else if (typeof height === 'function') {
    cb = height
    width = defaults.width
    height = defaults.height
  }

  let file = './node_modules/ffmpeg/ffmpeg'

  if (simulatevr) {
    args = ['-vf', '[0]lenscorrection=0.5:0.5:0.5:0.5[x]; [x]scale=' + width * 0.8 + ':-1[y]; [y]split[l][r]; [l][r]hstack'].concat(args)
  } else {
    args = args.concat(['-vf', 'scale=trunc(oh*a/2)*2:ih'])
  }

  switch (os) {
    case 'darwin':
      args = ['-f', 'avfoundation', '-capture_cursor', '1', '-i', '1'].concat(args)
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
