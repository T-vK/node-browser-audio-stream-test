const program = require('commander')
const mic = require('mic')
const Speaker = require('speaker')
const fs = require('fs')
const http = require('http')
const Koa = require('koa')
const KoaRouter = require('koa-router')
const SocketIO = require('socket.io')
const ss = require('socket.io-stream')

const package = require('./package.json')

/* ------------------------------- */
/* ----- Configuration Start ----- */
program
  .version(package.version)
  .option('-p, --port <port>', 'Host HTTP server on this port.', 3344)
  .option('-i, --input [device-name]', 'Input device (Leave empty to use the default recording device.)')
  .option('-o, --output [device-name]', 'Output device (Leave empty to use the default playback device.)')
  .option('-a, --mic-channels <count>', 'Number of channels 1=mono; 2=stereo',1)
  .option('-b, --speaker-channels <count>', 'Number of channels 1=mono; 2=stereo',b=>parseInt(b),2)
  .option('-d, --debug <bool>', 'true to enable debug, false to disable debug.',d=>d==='true',false)
  .option('-g, --log <file>', 'Log to file (Leave empty to not log to a file.)')
  .parse(process.argv)

if (program.log) {
    const fs = require('fs')
    const util = require('util')
    const log_file = fs.createWriteStream(program.log, {flags : 'w'})
    const log_stdout = process.stdout
    const log_stderr = process.stderr

    console.log = function(d) {
        log_file.write(util.format(d) + '\n')
        log_stdout.write(util.format(d) + '\n')
    }

    console.error = function(d) {
        log_file.write(util.format(d) + '\n')
        log_stderr.write(util.format(d) + '\n')
    }
}

let speakerConfig = { // | aplay -D plughw:NVidia,7
    //device: program.output, // -D plughw:NVidia,7
    channels: 2,
    bitDepth: 16,
    sampleRate: 44100,
    signed: true
}
if (program.output)
    speakerConfig.device = program.output
if (program['speaker-channels'])
    speakerConfig.channels = parseInt(program['speaker-channels'])

let micConfig = {       // arecord -D hw:0,0 -f S16_LE -r 44100 -c 2
    //device: program.input,    // -D hw:0,0
    encoding: 'signed-integer', //           -f S
    bitwidth: '16',             //               16
    endian: 'little',           //                 _LE
    rate: '44100',              //                     -r 44100
    channels: '2',              //                              -c 2
    debug: program.debug
}
if (program.input)
    micConfig.device = program.input
if (program['mic-channels'])
    speakerConfig.channels = program['mic-channels']

console.log('\nSpeaker config')
console.log(speakerConfig)
console.log('\nMic config')
console.log(micConfig)
/* ----- Configuration End ----- */
/* ----------------------------- */

let busy = false
function setupStream(socket) {
    busy = true
    socket.on('error', error => {
        console.error("Socket error: " + error)
    })
    let micInstance = mic(micConfig)
    let micInputStream = micInstance.getAudioStream()
    //micInputStream.on('data', data => {
    //    console.log("Recieved Input Stream: " + data.length)
    //})
    micInputStream.on('error', err => {
        console.error("MIC-ERROR: Error in Input Stream: " + err)
    })
    //playStream(socket)
    //socket.pipe(speakerInstance)
    
    let speakerInstance = new Speaker(speakerConfig)
    speakerInstance.on('open', () => {
        console.log("Speaker event: open")
    })
    speakerInstance.on('flush', () => {
        console.log("Speaker event: flush")
    })
    speakerInstance.on('close', () => {
        console.log("Speaker event: close")
    })

    ss(socket).on('client-connect', (stream, data) => { // stream: duplex stream
        stream.pipe(speakerInstance) //speakerInstance: writable stream
        micInputStream.pipe(stream) //micInputStream: readable stream
        micInstance.start()
    })

    socket.on('disconnect', reason => {
        micInstance.stop()
        micInputStream.destroy()
        micInputStream = undefined
        micInstance = undefined
        socket.destroy()
        speakerInstance.destroy()
        speakerInstance = undefined
        busy = false
    })
}

const app = new Koa()
const router = new KoaRouter()

router.get("/app", async(ctx, next) => {
    console.log("asdasd")
    ctx.set('content-type', 'text/html')
    ctx.body = fs.createReadStream(`${__dirname}/client.html`)
})
router.get("/socket.io-stream.js", async(ctx, next) => {
    ctx.set('content-type', 'text/javascript')
    ctx.body = fs.createReadStream(`${__dirname}/node_modules/socket.io-stream/socket.io-stream.js`)
})
app.use(router.routes())
   .use(router.allowedMethods())

const httpServer = http.createServer(app.callback())
const io = new SocketIO(httpServer,{serveClient:true})

io.on('error', err => {
    console.error('Socket error: ' + err)
})

io.on('connection', socket => {
    console.log('A client has connected.')
    if (!busy)
        setupStream(socket)
})

httpServer.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})
httpServer.listen(program.port,'0.0.0.0', () => {
    console.log(`HTTP server ready! (Port: ${program.port})`)
})
