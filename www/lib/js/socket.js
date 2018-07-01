const canvas = document.getElementById('video')
const url = `ws://${document.location.host}`

window.client = new window.WebSocket(url)

const player = new window.JSMpeg.Player(url, {
  canvas,
  chunkSize: 1024 * 1024 * 2,
  videoBufferSize: 1024 * 1024
})
