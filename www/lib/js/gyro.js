var FULLTILT, requestAnimationFrame, client, view, fulltiltOrientation, platform

let motion = new FULLTILT.getDeviceMotion()
motion.then((motionData) => {
  fulltiltOrientation = motionData
}).catch((msg) => {
  console.error(msg)
  console.log('Data not available!')
})

var sendOrientation = function () {
  if (fulltiltOrientation && inVR()) {
    let motionData = fulltiltOrientation.getScreenAdjustedRotationRate()
    let obj = {}
    obj.alpha = motionData.alpha
    obj.beta = motionData.beta
    obj.gamma = motionData.gamma
    client.send(JSON.stringify(obj))
  }

  requestAnimationFrame(sendOrientation)
}
sendOrientation()

var inVR = function () {
  if (!window.navigator.standalone && platform.os.family === 'iOS' && parseInt(platform.os.version, 10) >= 8 && view === 'minimal' || window.innerWidth > window.innerHeight && (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/iemobile/i))) {
    return true
  }
  return false
}

let touches = 0
var touched = function (e) {
  if (client) {
    touches++
  }
}

document.ontouchend = function () {
  if (touches > 3) {
    console.log('invertX')
    client.send('invertX')
  } else if (touches > 2) {
    console.log('recalibrate')
    client.send('recalibrate')
  } else if (touches > 1) {
    client.send('rightClick')
    console.log('rightClick')
  } else if (touches > 0) {
    client.send('mouseClick')
    console.log('mouseClick')
  }
  touches = 0
}

touched()
