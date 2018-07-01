var Image, WebSocket
let client = new WebSocket('ws://' + window.location.host)
let canvas = document.getElementById('video')
let context = canvas.getContext('2d')

client.binaryType = 'arraybuffer'
client.onmessage = (event) => {
  const image = new Image()
  image.onload = () => {
    canvas.width = image.width
    canvas.height = image.height
    context.drawImage(image, 0, 0, image.width, image.height)
  }

  const bytes = new Uint8Array(event.data)
  const blob = new window.Blob([bytes], { type: 'image/jpeg' })
  const urlCreator = window.URL || window.webkitURL
  const imageURL = urlCreator.createObjectURL(blob)
  image.src = imageURL
}
