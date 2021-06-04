var audio = document.getElementById("audio");
var playPauseBTN = document.getElementById("mute");
var audioImg = document.getElementById("volume")

var count = 0;

const mute = [
    "sounds/mute.png",
    "sounds/volume.png"
];

function playPause() {
    playPauseBTN.blur();
    if (count == 0) {
        count = 1;
        audio.play();   // playing audio
        audio.volume = 0.1;
        audioImg.src = mute[1];
        audio.addEventListener('ended', function () {
            this.currentTime = 0;   // looping the audio
            this.play();
        }, false);
        playPauseBTN.innerHTML = "ON";
    } else {
        count = 0;
        audio.pause(); // pausing audio
        playPauseBTN.innerHTML = "OFF";
        audioImg.src = mute[0];
    }
}
