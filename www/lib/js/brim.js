var gajus, brim, platform, view, touched

if (!window.navigator.standalone && platform.os.family === 'iOS' && parseInt(platform.os.version, 10) >= 8) {
  let scream = gajus.Scream({
    width: {
      portrait: 320,
      landscape: 640
    }
  })

  brim = gajus.Brim({
    viewport: scream
  })

  brim.on('viewchange', function (e) {
    view = e.viewName
    if (e.viewName === 'minimal') {
      document.ontouchstart = function (e) {
        e.preventDefault()
        touched(e)
      }
    } else {
      document.ontouchstart = function (e) {
        touched(e)
      }
    }
  })
} else if (platform.os.family === 'iOS' && parseInt(platform.os.version, 10) >= 8) {
  window.addEventListener('orientationchange', function () {
    if (window.orientation) {
      view = 'minimal'
      document.getElementsByClassName('cover')[0].style.display = 'none'
    } else {
      document.getElementsByClassName('cover')[0].style.display = 'block'
    }
  }, false)
  document.ontouchstart = function (e) {
    e.preventDefault()
    touched(e)
  }
  document.body.innerHTML = document.getElementById('brim-mask').innerHTML + document.getElementById('brim-main').innerHTML
  if (window.orientation) {
    view = 'minimal'
    document.getElementsByClassName('cover')[0].style.display = 'none'
  }
} else {
  document.body.innerHTML = document.getElementById('brim-main').innerHTML
}
