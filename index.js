/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* jslint node: true, esversion: 6 */

'use strict';

const Speaker = require('speaker');
const Readable = require('stream').Readable;

module.exports = function(RED) {

  function Node(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    node.on('input', function(msg) {
      if (!msg.payload) {
        let message = 'Missing property: msg.payload';
        node.error(message, msg);
        return;
      }
      let {payload} = msg;
    
      // Create the Speaker instance 
      let speaker = new Speaker({
        channels: 1,          // 2 channels 
        bitDepth: 16,         // 16-bit samples 
        sampleRate: 22050     // 44,100 Hz sample rate 
      });

      let readable = new Readable({
        highWaterMark: payload.length,
        read: function(size) {
          // console.log('READ');
          this.push(payload);
          this.push(null);
        }
      });

      readable.pipe(speaker);

      speaker.on('finish', function() {
        // console.log('FINISH');
        node.send({payload:'playback finished'});
      });

    });

    node.on('close', function() {
      // console.log('CLOSE');
    });

  }

  RED.nodes.registerType("audiobuffer-to-speaker", Node);

}


// const fs = require('fs');
// // Create the Speaker instance 
// var speaker = new Speaker({
//   channels: 1,          // 2 channels 
//   bitDepth: 16,         // 16-bit samples 
//   sampleRate: 22050     // 44,100 Hz sample rate 
// });

// let fileBuffer = fs.readFileSync('./activated.wav');
// console.log('fileBuffer ', fileBuffer.length);
// let readable = new Readable({
//   highWaterMark: fileBuffer.length,
//   read: function(size) {
//     this.push(fileBuffer);
//     this.push(null);
//   }
// });

// readable.pipe(speaker);

// speaker.on('finish', function() {
//   console.log('END');
// });