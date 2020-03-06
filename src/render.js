
// Buttons
const videoElement = document.querySelector('video');

const startBtn = document.getElementById('startBtn');

startBtn.onclick = e => {
    mediaRecorder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
}
const stopBtn = document.getElementById('stopBtn');

stopBtn.onclick = e => {
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
}

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

let mediaRecorder;
const recordedChunks = [];

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

    // Create media recorder

    const options = { mimeType: 'video/webm; codecs=vp9'};
    mediaRecorder = new MediaRecorder(stream, options);

    // Register event handlers

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
}

function handleDataAvailable(e) {
    console.log('video data available');
    recordedChunks.push(e.data);
}

const { dialog } = remote;

const {writeFile} = require('fs');

// Saves the video file on stop
async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const {filePath} = await dialog.showSaveDialog({
        buttonLabel: 'Save Video',
        defaultPath: `vid-${Date.now()}.webm`
    });

    console.log(filePath);

    writeFile(filePath, buffer, () => console.log('Video saved successfully!'));
}