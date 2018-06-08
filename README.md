# node-browser-audio-stream-test

## Todo list

- [x] Write a test html page that can pipe the browser mic to the brwoser speaker.
- [x] Write a test script for node.js to pipe a mic on the server side to a speaker on the server side.
- [ ] Write the main application. (In progress...)

## Description

VoIP between a browser and a Node.js server.

## Usage

When the `server.js` is started it will automatically host the `client.html` under `http://localhost:3344/app`  
By opening that URL a connection between the server and the client should be established automatically.

Here is how to start the server:

```
  Usage: node server.js [options]


  Options:

    -V, --version                   output the version number
    -p, --port <port>               Host HTTP server on this port. (default: 3344)
    -i, --input [device-name]       Input device (Leave empty to use the default recording device.)
    -o, --output [device-name]      Output device (Leave empty to use the default playback device.)
    -a, --mic-channels <count>      Number of channels 1=mono; 2=stereo (default: 1)
    -b, --speaker-channels <count>  Number of channels 1=mono; 2=stereo (default: 2)
    -d, --debug <bool>              true to enable debug, false to disable debug. (default: false)
    -g, --log <file>                Log to file (Leave empty to not log to a file.)
    -h, --help                      output usage information

  Examples:

    node server.js --port 3344 --input hw:0,0 --output hw:1,1
    node server.js --input hw:2,0 --output plughw:2,0
    node server.js


```
(The format for the input/output device comes from ALSA. Please refer to `arecord` and `aplay` and this [stackoverflow question](https://superuser.com/questions/53957/what-do-alsa-devices-like-hw0-0-mean-how-do-i-figure-out-which-to-use).)


## Installation

### Dependencies (for the audio backend)

#### If you are on Linux:
You will need ALSA.  

 - Debian, Ubuntu, Raspbian etc.:
    The packages are usually called `libasound2-dev`, `alsa-base` and `alsa-utils` on debian-like systems (`sudo apt-get install libasound2-dev alsa-base alsa-utils`).  
 - Fedora and possibly other rpm based distros:
    You find them as `alsa-lib-devel` `alsa-utils` and `alsa-lib` (`sudo dnf install alsa-lib-devel alsa-utils alsa-lib`)
 - Other
    Please use your favourite search engine to find out and report back if you got it to work. :)

#### If you are on Mac OS X:
You will need SoX. Please go here: [SoX](https://sourceforge.net/projects/sox/files/sox/)

#### If you are on Windows:
You will need SoX. Please go here: [SoX](https://sourceforge.net/projects/sox/files/sox/)

### General dependencies

 - First you need to install a recent version of [NodeJS](https://nodejs.org/en/download/).
 - Secondly you need git. [You can get it here](https://git-scm.com/downloads)
 - Finally you need node-gyp (installation differs for Linux, OS X and Win). [Follow these steps.](https://github.com/nodejs/node-gyp)

### Actual installation of node-browser-audio-stream-test

 - From your terminal/command line:
    - Clone this repository recursively: `git clone https://github.com/T-vK/node-browser-audio-stream-test.git`
    - Enter the project's directory: `cd node-browser-audio-stream-test`
    - Install and compile the dependencies: `npm i`

### Questions, Feature requests, Pull Requests, Problems?
Please open an issue [right here](https://github.com/T-vK/node-browser-audio-stream-test/issues) on Github.
