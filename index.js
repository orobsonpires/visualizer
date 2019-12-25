const micStream = require('mic-stream');
const Through = require('audio-through');
const Gpio = require('onoff').Gpio;

// LEDs
var led1 = new Gpio(4, 'out');
var led2 = new Gpio(14, 'out');
var led3 = new Gpio(15, 'out');

// listen to microphone
var s = micStream();

s.pipe(Through());
s.on('data', function (buf) {
    let pcmdata = (buf.getChannelData(0));
    let samplerate = buf.sampleRate;
    maxvals = []; max = 0;

    findPeaks(pcmdata, samplerate);
});

function findPeaks(pcmdata, samplerate) {
    var interval = 0.05 * 1000; index = 0;
    var step = Math.round(samplerate * (interval / 1000));
    var max = 0;
    var prevmax = 0;
    var prevdiffthreshold = 0.3;

    endBlink();

    var samplesound = setInterval(function () {

        if (index >= pcmdata.length) {
            clearInterval(samplesound);
            console.log("finished sampling sound")
            return;
        }

        for (var i = index; i < index + step; i++) {
            max = pcmdata[i] > max ? pcmdata[i].toFixed(1) : max;
        }

        bars = getbars(max);
        if (max - prevmax >= prevdiffthreshold) {
            bars = bars + " == peak == "
        }

        console.log(bars, max)

        if (max >= 0.1) {
            blinkLED(led1);
        }

        if (max >= 0.2) {
            blinkLED(led2);
        }

        if (max >= 0.3) {
            blinkLED(led3);
        }

        prevmax = max; max = 0; index += step;
    }, interval, pcmdata);
}

function getbars(val) {
    bars = ""
    for (var i = 0; i < val * 50 + 2; i++) {
        bars = bars + "|";
    }
    return bars;
}

function blinkLED(led) { //function to start blinking
    if (led.readSync() === 0) { //check the pin state, if the state is 0 (or off)
        led.writeSync(1); //set pin state to 1 (turn LED on)
    } else {
        led.writeSync(0); //set pin state to 0 (turn LED off)
    }
}

function endBlink() { //function to stop blinking
    led1.writeSync(0);
    led2.writeSync(0);
    led3.writeSync(0);
}

//setTimeout(endBlink, 5000);