
// Buttons
const videoElement = document.querySelector('video');

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');
videoSelectBtn.onclick = getVideoSources;

const { desktopCapturer, remote} = require('electron');
const { Menu } = remote;

// Get the available sources

async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window','screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );

    videoOptionsMenu.popup();
}

// Change the window to record

async function selectSource(source) {
    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video : {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };

    // Create stream

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Preview the stream in the video element

    videoElement.srcObject = stream;
    videoElement.play();
}