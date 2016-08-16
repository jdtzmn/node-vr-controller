var Image, WebSocket
let client = new WebSocket('ws://' + window.location.host)
client.onmessage = function onmessage (event) {
  if (event.data.size === undefined) {
    let canvas = document.getElementById('video')
    var context = canvas.getContext('2d')
    var image = new Image()
    image.onload = function () {
      canvas.width = image.width
      canvas.height = image.height
      context.drawImage(image, 0, 0, image.width, image.height)
    }
    image.src = event.data
  }
}
