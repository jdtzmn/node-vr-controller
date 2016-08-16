#!/usr/bin/env node
const path = require('path')
const ffmpeg = require('./lib/ffmpeg.js')
const robot = require('robotjs')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const argv = require('minimist')(process.argv.slice(2))
let ws = require('express-ws')(app)
let clients = []

if (argv.h) {
  console.log(
		'Usage: \n' +
		'npm start  \n\n' +
    'Flags: \n' +
    '-h: Access this menu. \n' +
    '-p: Change the host port. \n' +
    '-s: Change the secret. \n' +
    '-r: Ratio of rotation of phone to speed of mouse. \n' +
    '-i: Invert the mouse movement (For computer control).'
	)
  process.exit()
}

const port = argv.p || process.env.PORT || 3000
const secret = argv.s
const mouseRatio = argv.r || 1
let width = 720
let height = 405
let last = ''

app.use(express.static(path.join(__dirname, '/www/dist')))
app.use(bodyParser.urlencoded({ extended: true }))

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

    var data = []
    var length = 0

    req.on('data', (chunk) => {
      data.push(chunk)
      length += chunk.length
    })

    req.on('end', (chunk) => {
      var buf = new Buffer(length)
      for (var i = 0, l = data.length, p = 0; i < l; i++) {
        data[i].copy(buf, p)
        p += data[i].length
      }

      ws.broadcast(buf, {binary: false})
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
  res.sendFile(path.join(__dirname, '/www/index.html'))
})

app.ws('/', (socket, req) => {
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

  socket.on('disconnect', () => {
    if (clients.indexOf(socket) > -1) clients.splice(clients.indexOf(socket), 1)
    console.log('Socket disconnected')
  })
})

ws.broadcast = function (data, opts) {
  for (var i in clients) {
    if (clients[i].readyState === 1) {
      clients[i].send('data:image/jpeg;base64,' + data.toString('base64'), opts)
    }
  }
}

app.listen(port, () => {
  console.log('Listening on port: ' + port)
  ffmpeg(process.platform, 'http://localhost:' + port + '/' + secret + '/' + width + '/' + height + '/image-%3d.jpg', (err, msg) => {
    if (err) console.error(err)
    if (msg) console.log(msg)
  })
})
