const micStream = require('mic-stream');
const Through = require('audio-through');

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