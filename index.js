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
        node.status({fill:"red", shape:"dot", text:"Missing payload"});
        return;
      }
      let {payload} = msg;
    
      // Create the Speaker instance 
      let speaker = new Speaker({
        channels: config.channels, // 1 channel 
        bitDepth: config.bitrate, // 16-bit samples 
        sampleRate: config.samplerate // 22,050 Hz sample rate 
      });

      let readable = new Readable({
        highWaterMark: payload.length,
        read: function(size) {
          this.push(payload);
          this.push(null);
        }
      });

      node.status({fill:"yellow", shape:"dot", text:"playback..."});
      readable.pipe(speaker);

      speaker.on('finish', function() {
        node.status({fill:"green", shape:"dot", text:"finished"});
        node.send({payload:'playback finished'});
      });

    });

    node.on('close', function() {
      node.status({fill:"red", shape:"dot", text:"closed"});
    });

  }

  RED.nodes.registerType("audiobuffer-to-speaker", Node);

}
