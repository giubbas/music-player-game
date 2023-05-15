const beat0 = new Audio('./assets/audio/beats/beat-0.mp3')
const beat1 = new Audio('./assets/audio/beats/beat-1.mp3')
const beat2 = new Audio('./assets/audio/beats/beat-2.mp3')
const beat3 = new Audio('./assets/audio/beats/beat-3.mp3')
const beat4 = new Audio('./assets/audio/beats/beat-4.mp3')
const beat5 = new Audio('./assets/audio/beats/beat-5.mp3')

beat0.name = 'Beat 21'
beat1.name = 'Beat 26 (Call Me)'
beat2.name = 'Beat 11'
beat3.name = 'Beat 15'
beat4.name = 'Beat 2'
beat5.name = 'Beat 23'

const beatsArr = [beat0, beat1, beat2, beat3, beat4, beat5]

const roomTone = new Audio('./assets/audio/roomTone.mp3')
roomTone.loop = true
roomTone.volume = 0.8

const pickupCoin = new Audio('./assets/audio/pickup-coin.mp3')
pickupCoin.volume = 0.4
pickupCoin.load()

const coinDropSound = new Audio('./assets/audio/coin-drop.mp3')
coinDropSound.volume = 0.4
coinDropSound.load()

const noCreditSound = new Audio('./assets/audio/no-credit.wav')
noCreditSound.load()

const insertCoinFail = new Audio('./assets/audio/insert-coin-fail.mp3')
insertCoinFail.volume = 0.4
insertCoinFail.load()