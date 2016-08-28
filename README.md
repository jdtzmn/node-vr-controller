# node-vr-controller
Easily control vr apps using phone device motion

```bash
$ node index.js -s pass
   _________________________________
  |                                 |
  |  Turn on your phone and go to:  |
  |  127.0.0.1:3000                 |
  |                                 |
   ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾

   Listening on port: 3000
   Stream : ::1: size: 1000x562
```

## Install

##### 1. `$ git clone https://github.com/jdtzmn/node-vr-controller.git`

##### 2. `$ npm install`

##### 3. `$ bower install`

## Usage
```bash
$ npm start

  Usage:
  npm start [-- <args>]

  Arguments:
  -h: Access this menu.
  -p [3000]: Change the host port.
  -d [720x405]: Change the video dimensions.
  -s ['12345']: Change the secret.
  -r [1]: Ratio of rotation of phone to speed of mouse.
  -i [false]: Invert the mouse movement (For computer control).
```
