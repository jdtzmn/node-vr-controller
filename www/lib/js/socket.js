var Image, WebSocket
let client = new WebSocket('ws://' + window.location.host)
let canvas = document.getElementById('video')
let context = canvas.getContext('2d')
client.onmessage = (event) => {
  if (event.data.size === undefined) {
    let image = new Image()
    image.onload = () => {
      canvas.width = image.width
      canvas.height = image.height
      context.drawImage(image, 0, 0, image.width, image.height)
    }
    image.src = event.data
  }
}
