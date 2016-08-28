var Image, WebSocket
let client = new WebSocket('ws://' + window.location.host)
let canvas = document.getElementById('video')
let player = new jsmpeg(client, {canvas: canvas})
