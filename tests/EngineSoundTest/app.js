//TURN DOWN THE VOLUME!!!
const audioCtx = new AudioContext();

// create Oscillator node
const oscillator = audioCtx.createOscillator();
const gainNode = audioCtx.createGain();


oscillator.type = "sawtooth";
oscillator.connect(audioCtx.destination);
oscillator.start();

gainNode.gain.setValueAtTime(0, 0);
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);

oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);

function changeFreq(freq, del){
    oscillator.frequency.setValueAtTime(freq, del);
    return del;
}

console.log(oscillator)

const RPMarray = returnArray();
let del = audioCtx.currentTime;
let stepTime = 0.02;

for(let i = 0; i < RPMarray.length; i++){
    changeFreq(RPMarray[i]/60, del); 
    del += stepTime;
}