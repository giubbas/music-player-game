function init() {

  // Variables
  let requestID
  let coinsOwned = 0
  let jukeboxCredit = 0

  // Elements
  const canvas = document.querySelector('canvas')
  const ctx = canvas.getContext('2d')
  const canvasWrapper = document.getElementById('canvas-wrapper')
  const cover = document.getElementById('cover')
  const startBtn = document.getElementById('start-btn')
  const quitBtn = document.getElementById('quit-btn')
  const bookStandCloseBtn = document.getElementById('book-stand-close-btn')
  let jukeboxCreditDisplay
  const coinsOwnedDisplay = document.getElementById('coins-owned')
  coinsOwnedDisplay.innerText = coinsOwned
  const soundBtn = document.getElementById('sound-btn')
  let sound = true

  canvas.width = 600
  canvas.height = 600

  const collisionsMap = []
  for (let i = 0; i < collisions.length; i += 50) {
    collisionsMap.push(collisions.slice(i, 50 + i))
  }

  class Boundary {
    static width = 40
    static height = 40
    constructor({ name, position, width, height }) {
      this.name = name
      this.position = position
      this.width = 40
      this.height = 40
    }
    draw() {
      ctx.fillStyle = 'rgba(255,0,0,0.0)'
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
  }

  const boundaries = []

  const offset = {
    x: 0,
    y: -250
  }

  const collisionsPlacement = () => {
    collisionsMap.forEach((row, i) => {
      row.forEach((symbol, j) => {
        if (symbol === 16349)
          boundaries.push(new Boundary({
            name: 'boundary',
            position: {
              x: j * Boundary.width + offset.x,
              y: i * Boundary.height + offset.y,
            }
        }))
      })
    })
  }
  collisionsPlacement()

  // Map image
  const map = new Image()
  map.src = './assets/map.png'

  // Foreground image
  const foregroundImage = new Image()
  foregroundImage.src = './assets/foregroundObjects.png'

  // Player sprites
  const playerUpImage = new Image()
  playerUpImage.src = './assets/playerUp.png'

  const playerRightImage = new Image()
  playerRightImage.src = './assets/playerRight.png'

  const playerDownImage = new Image()
  playerDownImage.src = './assets/playerDown.png'

  const playerLeftImage = new Image()
  playerLeftImage.src = './assets/playerLeft.png'

  class Sprite {
    constructor({ name, position, velocity, image, frames = {max: 1}, sprites }) {
      this.name = name
      this.position = position
      this.image = image
      this.frames = {...frames, val: 0, elapsed: 0}
      this.image.onload = () => {
        this.width = this.image.width / this.frames.max
        this.height = this.image.height
      }
      this.width = this.image.width / this.frames.max
      this.height = this.image.height
      this.moving = false
      this.sprites = sprites
    }
    draw() {
      ctx.drawImage(
        this.image,
        this.frames.val * this.width,
        0,
        this.image.width / this.frames.max,
        this.image.height,
        this.position.x,
        this.position.y,
        this.image.width / this.frames.max,
        this.image.height,
        )

        if (this.frames.max === 4 && !this.moving) return

        if (this.frames.max > 1) {
          this.frames.elapsed++
        }
        if (this.frames.elapsed % 10 === 0) {
          if (this.frames.val < this.frames.max - 1) this.frames.val++
          else this.frames.val = 0
        }
    }
  }

  const player = new Sprite({
    position: {
      x: canvas.width / 2 - 200 / 4 / 2,
      y: canvas.height / 2 - 72 / 2
    },
    image: playerDownImage,
    frames: {
      max: 4
    },
    sprites: {
      up: playerUpImage,
      right: playerRightImage,
      down: playerDownImage,
      left: playerLeftImage
    },
  })

  const background = new Sprite({
    position: {
      x: offset.x,
      y: offset.y
    },
    image: map
  })

  const foreground = new Sprite({
    position: {
      x: offset.x,
      y: offset.y
    },
    image: foregroundImage
  })

  const coinsObjArr = []

  // Get positions from coinsArr data and create multiple coins objects
  const coinsPlacement = () => {
    coinsArr.forEach((item, index) => {
      const imgName = `coinImage${index}`
      coinsObjArr.push(new Sprite({
        name: 'coin',
        position: {
          x: item[0],
          y: item[1]
        },
        image: eval(imgName),
        frames: {
          max: 6
        },
      }))
    })
  }
  coinsPlacement()

  const bookStand = new Boundary({
    name: 'bookStand',
    position: {
      x: 340,
      y: 250,
    }
  })

  const jukebox = new Boundary({
    name: 'jukebox',
    position: {
      x: 780,
      y: 70,
    }
  })

  const museumPiece = new Boundary({
    name: 'museumPiece',
    position: {
      x: 1080,
      y: 170,
    }
  })

  interactionsArr = [bookStand, jukebox, museumPiece]

  const keys = {
    ArrowUp: {
      pressed: false
    },
    ArrowRight: {
      pressed: false
    },
    ArrowDown: {
      pressed: false
    },
    ArrowLeft: {
      pressed: false
    },
    Enter: {
      pressed: false
    }
  }

  let movables

  function rectangularCollision({rectangle1, rectangle2}) {
    return (
      rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
      rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
      rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
      rectangle1.position.y + rectangle1.height >= rectangle2.position.y
    )
  }

  // Call to action boxes
  let displayCallToAction
  const removeDisplayCalltoAction = () => {
    displayCallToAction.remove()
    displayCallToAction = null
  }

  const callToAction = () => {
    if (!displayCallToAction) {
      displayCallToAction = document.createElement('div')
      displayCallToAction.innerHTML = '<h4>Press ENTER to interact</h4>'      
      displayCallToAction.className = 'box dialogue-window-bottom'
      canvasWrapper.appendChild(displayCallToAction)
      setTimeout(removeDisplayCalltoAction, 1000)
    }
  }

  let guideBook
  const intructionsInteract = () => {
    if (!guideBook) {
      guideBook = document.createElement('div')
      guideBook.className = 'box dialogue-window-bottom'
      guideBook.id = 'book-stand-display'
      guideBook.innerHTML = `
      <p>Welcome to the music player</p>
      <button class="dialogue-btn" id="dialogue-next-btn">Next</button>
      `
      canvasWrapper.appendChild(guideBook)
      window.cancelAnimationFrame(requestID)

      const nextBtn = document.getElementById('dialogue-next-btn')
      nextBtn.addEventListener('click', () => {
        guideBook.innerHTML = `
        <p>To play music, collect all coins and find the jukebox.</p>
        <button class="dialogue-btn" id="book-stand">Close</button>
        `
      })
    }
  }

  let museumPieceBox
  const museumPieceInteract = () => {
    if (!museumPieceBox) {
      museumPieceBox = document.createElement('div')
      museumPieceBox.className = 'box dialogue-window-bottom'
      museumPieceBox.id = 'museum-piece-display'
      museumPieceBox.innerHTML = `
      <p>These are rare Juniprosaurus remains.</p>
      <button class="dialogue-btn" id="museum-piece">Close</button>
      `
      canvasWrapper.appendChild(museumPieceBox)
      window.cancelAnimationFrame(requestID)
    }
  }

  const displayTrackList = () => {
    for (let i = 0; i < 7; i++) {
      const beat = eval(`beat${i}`)
      const track = document.createElement('div')
      track.innerHTML = `
      <h5>Beat</h5>
      <div class="audio-controls">
        <button id="${i}" value="stop" name="beat${i}"><i class="fa-solid fa-play"></i></button>
        <div>
          <span id="beat${i}-current-time">0:00</span>
          <input type="range" id="beat${i}-seek-slider" max="${Math.floor(beat.duration)}" value="0">
          <span id="beat${i}-duration"></span>
        </div>
      </div>
      `
      const tracklist = document.getElementById('tracklist')
      tracklist.appendChild(track)

      // Audio controls elements
      const beatDurationDisplay = document.getElementById(`beat${i}-duration`)
      const duration = calculateTime(beat.duration)
      beatDurationDisplay.innerText = duration


      const seekSlider = document.getElementById(`beat${i}-seek-slider`)

      // Update the current time displayed
      const currentTimeContainer = document.getElementById(`beat${i}-current-time`)
      seekSlider.addEventListener('input', () => {
        currentTimeContainer.innerText = calculateTime(seekSlider.value)
      })

      // Update slider when user interacts with it
      seekSlider.addEventListener('change', () => {
        beat.currentTime = seekSlider.value
      })

      const jukeboxPlayBtn = document.getElementById(`${i}`)
      jukeboxPlayBtn.className = 'jukebox-play-btn'
      jukeboxPlayBtn.addEventListener('click', (e) => {
          jukeboxPlayBeat(e)
      })

      // Update the slider when the song is playing
      beat.addEventListener('timeupdate', () => {
        seekSlider.value = Math.floor(beat.currentTime)
        currentTimeContainer.innerText = calculateTime(seekSlider.value)
        if (beat.currentTime === beat.duration) {
          jukeboxPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>'
          beat.currentTime = 0
          beat.value = 'reset'
        }
      })
    }
  }

  let musicPlayer
  const jukeboxInteract = () => {
    if (!musicPlayer) {
      musicPlayer = document.createElement('div')
      musicPlayer.className = 'box central-window'
      musicPlayer.id = 'music-player-display'
      musicPlayer.innerHTML = `
      <button id="jukebox-close-btn">X</button>
      <h2>Jukebox</h2>
      <div id="music-player-credit-container">
        <button id="insert-coin-btn">INSERT COIN</button>
        <div>
          <label>CREDIT:</label>
          <span id="jukebox-credit-display"></span>
          <img src="./assets/coin-images/credit-coin.png" alt="coin" />
        </div>
      </div>
      <div id="tracklist"></div>
      `
      canvasWrapper.appendChild(musicPlayer)
      jukeboxCreditDisplay = document.getElementById('jukebox-credit-display')
      jukeboxCreditDisplay.innerText = jukeboxCredit
      displayTrackList()
    }
  }

  const insertCoin = () => {
    if (coinsOwned > 0) {
      jukeboxCredit++
      coinsOwned--
      coinsOwnedDisplay.innerText = coinsOwned
      jukeboxCreditDisplay.innerText = jukeboxCredit
    }
  }

  const noCreditWindow = () => {
    const window = document.createElement('div')
    window.className = 'box central-window'
    window.id = 'insufficient-credit-window'
    window.innerHTML = `
    <h3>Credit insufficient</h3>
    <p>Please, insert coin</p>
    <button class="dialogue-btn" id="insufficient-credit-btn">Close</button>
    `
    canvasWrapper.appendChild(window)
    const okBtn = document.getElementById('insufficient-credit-btn')
    okBtn.addEventListener('click', () => {
      window.remove()
    })
  }

  const jukeboxPlayBeat = (e) => {
    const audio = eval(e.currentTarget.name)
    const btn = e.currentTarget
    console.log('event --->', btn)
    if (jukeboxCredit > 0 && (!audio.value || audio.value === 'reset')) {
      resetPlayer()
      audio.play()
      audio.value = 'play'
      btn.innerHTML = '<i class="fa-solid fa-pause"></i>'
      jukeboxCredit--
      jukeboxCreditDisplay.innerHTML = jukeboxCredit
    } else if (audio.value === 'pause'){
      audio.play()
      audio.value = 'play'
      btn.innerHTML = '<i class="fa-solid fa-pause"></i>'
    } else if (audio.value === 'play') {
      audio.pause()
      audio.value = 'pause'
      btn.innerHTML = '<i class="fa-solid fa-play"></i>'
    } else {
      console.log('no credit!')
      noCreditWindow()
      sound && noCreditSound.play()
    }
  }

  // Convert audio time to a mm:ss format
  const calculateTime = (secs) => {
    const minutes = Math.floor(secs / 60)
    const seconds = Math.floor(secs % 60)
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`
    return `${minutes}:${returnedSeconds}`
  }

  const resetPlayer = () => {
    beatsArr.forEach(beat => {
      beat.pause()
      beat.currentTime = 0
      beat.value = 'reset'
    })

    const buttons = document.querySelectorAll('.jukebox-play-btn')
    for (item of buttons) {
      item.innerHTML = '<i class="fa-solid fa-play"></i>'
    }
  }

  const generalListener = (e) => {
    const element = e.target

    switch(element.id) {
      case 'book-stand':
        guideBook.remove()
        guideBook = null
        animate()
        break
      case 'museum-piece':
        museumPieceBox.remove()
        museumPieceBox = null
        animate()
        break
      case 'jukebox-close-btn':
        animate()
        soundBtn.style.display = 'inline-block'
        roomTone.play()
        musicPlayer.style.display = 'none'
        resetPlayer()
        break
      case 'insert-coin-btn':
        insertCoin()
        sound && coinDropSound.play()
        break
    }
  }

  // const objectCollision = (obj) => {
  //   switch(obj.name) {
  //     case 'boundary':
  //       moving = false
  //       break
  //     case 'coin':
  //       coinsObjArr.splice(i, 1)
  //       coinsOwned++
  //       coinsOwnedDisplay.innerText = coinsOwned
  //       sound && pickupCoin.play()
  //       break
  //     case 'bookStand':
  //       callToAction()
  //       break
  //     case 'jukebox':
  //       callToAction()
  //       break
  //     case 'museumPiece':
  //       callToAction()
  //       break
  //   }
  // }

  const start = () => {
    cover.style.display = 'none'
    movables = [background, ...boundaries, foreground, ...coinsObjArr, bookStand, jukebox, museumPiece]
    animate()
    soundBtn.style.display = 'inline-block'
    sound && roomTone.play()
  }

  const quit = () => {
    cover.style.display = 'inline-block'
    window.cancelAnimationFrame(requestID)
    roomTone.pause()
    soundBtn.style.display = 'none'
    roomTone.currentTime = 0
    // Reset player position and image
    player.position = {
      x: canvas.width / 2 - 200 / 4 / 2,
      y: canvas.height / 2 - 72 / 2
    }
    player.image = playerDownImage

    // Reset background image
    background.position = {
      x: offset.x,
      y: offset.y
    }

    // Reset foreground objects
    foreground.position = {
      x: offset.x,
      y: offset.y
    }

    // Reset coins
    coinsObjArr.splice(0)
    coinsPlacement()

    // Reset boundaries
    boundaries.splice(0)
    collisionsPlacement()

    // Reset book stand position
    bookStand.position = {
      x: 340,
      y: 250,
    }

    // Reset jukebox position
    jukebox.position = {
      x: 780,
      y: 70,
    }

    // Reset museum piece position
    museumPiece.position = {
      x: 1080,
      y: 170,
    }
    
    // Reset coins
    coinsOwned = 0
    coinsOwnedDisplay.innerText = '0'

    // Reset jukebox credit
    if (jukeboxCreditDisplay)
      jukeboxCreditDisplay.innerText = '0'

    // Reset jukebox credit
    jukeboxCredit = 0

    // Close book stand window
    if (guideBook) {
      guideBook.remove()
      guideBook = null
    }

    // Close music player window
    if (musicPlayer) {
      musicPlayer.style.display = 'none'
      resetPlayer()
    }

    // Close museum piece window
    if (museumPieceBox) {
      museumPieceBox.remove()
      museumPieceBox = null
    }
  }

  const soundBtnToggle = () => {
    if (sound) {
      sound = false
      roomTone.pause()
      console.log('sound btn clicked')
      soundBtn.innerHTML = `
      <img src='./assets/sound-off.png' alt='sound-off-btn'/>
      `
    } else {
      sound = true
      roomTone.play()
      soundBtn.innerHTML = `
      <img src='./assets/sound.png' alt='sound-off-btn'/>
      `
    }
  }

  const animate = () => {
    requestID = window.requestAnimationFrame(animate)

    background.draw()
    boundaries.forEach(boundary =>{
      boundary.draw()
    })
    player.draw()
    foreground.draw()
    coinsObjArr.forEach(item => {
      item.draw()
    })
    bookStand.draw()
    jukebox.draw()
    museumPiece.draw()

    let moving = true
    player.moving = false
    if (keys.ArrowUp.pressed && lastKey === 'ArrowUp') {
      player.moving = true
      player.image = player.sprites.up

      const detectCollisions = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          const obj = arr[i]
          if (
            rectangularCollision({
              rectangle1: player,
              rectangle2: {...obj, position: {
                x: obj.position.x,
                y: obj.position.y + 3,
              }}
            })
          ) {
            switch(obj.name) {
              case 'boundary':
                moving = false
                break
              case 'coin':
                coinsObjArr.splice(i, 1)
                coinsOwned++
                coinsOwnedDisplay.innerText = coinsOwned
                pickupCoin.play()
                break
              case 'bookStand':
                callToAction()
                break
              case 'jukebox':
                callToAction()
                break
              case 'museumPiece':
                callToAction()
                break
            }
          }
        }
      }
      detectCollisions(boundaries)
      detectCollisions(coinsObjArr)
      detectCollisions(interactionsArr)

      if (moving)
        movables.forEach(movable => movable.position.y += 3)
    }
    else if (keys.ArrowRight.pressed && lastKey === 'ArrowRight') {
      player.moving = true
      player.image = player.sprites.right

      const detectCollisions = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          const obj = arr[i]
          if (
            rectangularCollision({
              rectangle1: player,
              rectangle2: {...obj, position: {
                x: obj.position.x - 3,
                y: obj.position.y,
              }}
            })
          ) {
            switch(obj.name) {
              case 'boundary':
                moving = false
                break
              case 'coin':
                coinsObjArr.splice(i, 1)
                coinsOwned++
                coinsOwnedDisplay.innerText = coinsOwned
                sound && pickupCoin.play()
                break
              case 'bookStand':
                callToAction()
                break
              case 'jukebox':
                callToAction()
                break
              case 'museumPiece':
                callToAction()
                break
            }
          }
        }
      }
      detectCollisions(boundaries)
      detectCollisions(coinsObjArr)
      detectCollisions(interactionsArr)

      if (moving)
        movables.forEach(movable => movable.position.x -= 3)
    }
    else if (keys.ArrowDown.pressed && lastKey === 'ArrowDown') {
      player.moving = true
      player.image = player.sprites.down

      const detectCollisions = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          const obj = arr[i]
          if (
            rectangularCollision({
              rectangle1: player,
              rectangle2: {...obj, position: {
                x: obj.position.x,
                y: obj.position.y - 3,
              }}
            })
          ) {
            switch(obj.name) {
              case 'boundary':
                moving = false
                break
              case 'coin':
                coinsObjArr.splice(i, 1)
                coinsOwned++
                coinsOwnedDisplay.innerText = coinsOwned
                sound && pickupCoin.play()
                break
              case 'bookStand':
                callToAction()
                break
              case 'jukebox':
                callToAction()
                break
              case 'museumPiece':
                callToAction()
                break
            }
          }
        }
      }
      detectCollisions(boundaries)
      detectCollisions(coinsObjArr)
      detectCollisions(interactionsArr)

      if (moving)
        movables.forEach(movable => movable.position.y -= 3)
    }
    else if (keys.ArrowLeft.pressed && lastKey === 'ArrowLeft'){
      player.moving = true
      player.image = player.sprites.left

      const detectCollisions = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          const obj = arr[i]
          if (
            rectangularCollision({
              rectangle1: player,
              rectangle2: {...obj, position: {
                x: obj.position.x + 3,
                y: obj.position.y,
              }}
            })
          ) {
            switch(obj.name) {
              case 'boundary':
                moving = false
                break
              case 'coin':
                coinsObjArr.splice(i, 1)
                coinsOwned++
                coinsOwnedDisplay.innerText = coinsOwned
                sound && pickupCoin.play()
                break
              case 'bookStand':
                callToAction()
                break
              case 'jukebox':
                callToAction()
                break
              case 'museumPiece':
                callToAction()
                break
            }
          }
        }
      }
      detectCollisions(boundaries)
      detectCollisions(coinsObjArr)
      detectCollisions(interactionsArr)
      
      if (moving)
        movables.forEach(movable => movable.position.x += 3)
    } else if (keys.Enter.pressed) {
      const detectCollisions = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          const obj = arr[i]
          if (
            rectangularCollision({
              rectangle1: player,
              rectangle2: {...obj, position: {
                x: obj.position.x + 3,
                y: obj.position.y,
              }}
            })
          ) {
            switch(obj.name) {
              case 'bookStand':
                intructionsInteract()
                break
              case 'jukebox':
                window.cancelAnimationFrame(requestID)
                roomTone.pause()
                !musicPlayer ? jukeboxInteract() : musicPlayer.style.display = 'inline-block'
                break
              case 'museumPiece':
                museumPieceInteract()
                break
            }
          }
        }
      }
      detectCollisions(boundaries)
      detectCollisions(coinsObjArr)
      detectCollisions(interactionsArr)
    }
  }

  let lastKey = ''
  
  // Events
  startBtn.addEventListener('click', start)
  quitBtn.addEventListener('click', quit)
  document.addEventListener('click', generalListener)
  soundBtn.addEventListener('click', soundBtnToggle)

  window.addEventListener('keydown', (e) => {

    switch (e.key) {
      case 'ArrowUp':
        keys.ArrowUp.pressed = true
        lastKey = 'ArrowUp'
        break
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        lastKey = 'ArrowRight'
        break
      case 'ArrowDown':
        keys.ArrowDown.pressed = true
        lastKey = 'ArrowDown'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        lastKey = 'ArrowLeft'
        break
      case 'Enter':
        keys.Enter.pressed = true
        break
    }
  })

  window.addEventListener('keyup', (e) => {

    switch (e.key) {
      case 'ArrowUp':
        keys.ArrowUp.pressed = false
        break
      case 'ArrowRight':
        keys.ArrowRight.pressed = false
        break
      case 'ArrowDown':
        keys.ArrowDown.pressed = false
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = false
        break
      case 'Enter':
        keys.Enter.pressed = false
        break
    }
  })
}
window.addEventListener('DOMContentLoaded', init)