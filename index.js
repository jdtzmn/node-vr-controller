#!/usr/bin/env node
const path = require('path')
const ffmpeg = require('./lib/ffmpeg.js')
const robot = require('robotjs')
const express = require('express')
const bodyParser = require('body-parser')
const uuid = require('uuid')
const sha256 = require('sha256')
const qrcode = require('qrcode-terminal')
const cookieParser = require('cookie-parser')
const app = express()
const server = require('http').Server(app)
const WebSocketServer = require('uws').Server
const uws = new WebSocketServer({server: server})
const os = require('os')
const interfaces = os.networkInterfaces()
const argv = require('minimist')(process.argv.slice(2))
const port = argv.p || process.env.PORT || 3000
const secret = argv.s || uuid.v1()
const mouseRatio = argv.r || 1
let clients = []
let addresses = []
let width = argv.d && argv.d.split('x')[0] || 1000
let height = argv.d && argv.d.split('x')[1] || 562
let last = ''

for (var i in interfaces) {
  for (var i2 in interfaces[i]) {
    var address = interfaces[i][i2]
    if (address.family === 'IPv4' && !address.internal) {
      addresses.push(address.address)
    }
  }
}

const domain = addresses[0] + ':' + port

if (argv.h || argv.noqr && !argv.s) {
  console.log(
		'Usage: \n' +
		'npm start [-- <args>]\n\n' +
    'Arguments: \n' +
    '-h: Access this menu. \n' +
    '-p [3000]: Change the host port. \n' +
    '-d [720x405]: Change the video dimensions. \n' +
    '-s [\'12345\']: Change the secret. \n' +
    '-r [1]: Ratio of rotation of phone to speed of mouse. \n' +
    '-i [false]: Invert the mouse movement (For computer control). \n' +
    '-m [1]: Choose a monitor to stream (Mac only). \n' +
    '--simulatevr [false]: Simulate a vr game by mirroring the screen. \n' +
    '--noqr [false]: Disable the qr code for easy login feature.'
	)
  process.exit()
}

app.use(express.static(path.join(__dirname, '/www/dist')))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.post('/secret', (req, res) => {
  if (sha256(secret) === sha256(req.body.hash)) {
    res.cookie('code', sha256(sha256(req.body.hash)), {expires: new Date(Date.now() + 8.64e+7), path: '/'})
    res.redirect('/?code=' + sha256(sha256(req.body.hash)))
  } else {
    res.status(400).redirect('/secret?wrong')
  }
})

app.post('/:secret/:width?/:height?/:image', (req, res) => {
  if (req.params.secret === secret) {
    width = req.params.width || 720
    height = req.params.height || 405

    let msg = 'Stream: ' +
      req.connection.remoteAddress + ':' +
      ' size: ' + width + 'x' + height

    if (msg !== last) {
      console.log(msg)
      last = msg
    }

    let data = []
    let length = 0

    req.on('data', (chunk) => {
      data.push(chunk)
      length += chunk.length
    })

    req.on('end', (chunk) => {
      let buf = new Buffer(length)
      for (let i = 0, l = data.length, p = 0; i < l; i++) {
        data[i].copy(buf, p)
        p += data[i].length
      }

      uws.broadcast(buf)
    })
  } else {
    let msg = 'Failed Stream Connection: ' +
    req.connection.remoteAddress +
    ' - incorrect secret'

    if (msg !== last) {
      console.log(msg)
      last = msg
    }
    res.end()
  }
})

app.get('/', (req, res) => {
  if (req.query.code && sha256(sha256(sha256(secret))) === sha256(req.query.code) || req.cookies.code && sha256(sha256(sha256(secret))) === sha256(req.cookies.code)) {
    if (req.cookies.code && req.query.code) return res.redirect('/')
    res.sendFile(path.join(__dirname, '/www/index.html'))
  } else {
    res.redirect('/secret')
  }
})

app.get('/secret', (req, res) => {
  res.sendFile(path.join(__dirname, '/www/secret.html'))
})

uws.on('connection', (socket) => {
  clients.push(socket)

  let header = new Buffer(8)
  header.write('jsmp')
  header.writeUInt16BE(width, 4)
  header.writeUInt16BE(height, 6)
  socket.send(header, { binary: true })

  console.log('New WebSocket Connection')

  socket.on('message', (event) => {
    if (event === 'invertX') {
      argv.i = !argv.i
      return
    } else if (event === 'mouseClick') {
      return robot.mouseClick()
    } else if (event === 'rightClick') {
      return robot.mouseClick('right')
    } else if (event === 'recalibrate') {
      let screen = robot.getScreenSize()
      return robot.moveMouse(screen.width / 2, screen.height / 2)
    }
    let data = JSON.parse(event)
    let mouse = robot.getMousePos()
    let y = Math.round(data.gamma)
    let x = argv.i ? Math.round(data.alpha) : -Math.round(data.alpha)

    x *= mouseRatio
    y *= mouseRatio

    x += mouse.x
    y += mouse.y

    robot.setMouseDelay(10)
    robot.moveMouse(x, y)
  })

  socket.on('close', () => {
    if (clients.indexOf(socket) > -1) {
      clients.splice(clients.indexOf(socket), 1)
      console.log('Socket disconnected')
    }
  })
})

uws.broadcast = function (data) {
  for (var i in clients) {
    if (clients[i].readyState === 1) {
      clients[i].send('data:image/jpeg;base64,' + data.toString('base64'), {binary: false})
    }
  }
}

server.listen(port, () => {
  if (!argv.f) {
    ffmpeg(process.platform, 'http://localhost:' + port + '/' + secret + '/' + width + '/' + height + '/image-%3d.jpg', height, width, undefined, argv.simulatevr, argv.m, (err, msg) => {
      if (err) {} else if (msg) {
        console.log(msg)
      }
    })
  }

  let displaypass = secret.length > 32 ? secret.substr(0, 28) + '...' : secret

  console.log(' _________________________________')
  console.log('|                                 |')
  console.log('|  Turn on your phone and go to:  |')
  console.log('|  ' + domain + new Array(32 - domain.length).join(' ') + '|')
  console.log('|                                 |')
  if (argv.s) {
    console.log('|  Password:                      |')
    console.log('|  ' + displaypass + new Array(32 - displaypass.length).join(' ') + '|')
    console.log('|                                 |')
  }
  console.log(' ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\n')
  if (!argv.noqr) {
    console.log('Then scan this (' + secret + '):\n')
    qrcode.generate(secret, (qr) => {
      console.log(qr + '\n')
    })
  }

  console.log('Listening on port: ' + port)
})
