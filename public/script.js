const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const muteButton = document.getElementById('muteButton');
const cameraButton = document.getElementById('cameraButton');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

let localStream;
let peer;

// Get user media (video and audio)
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localVideo.srcObject = stream;
        localStream = stream;

        // Initialize peer connection
        peer = new SimplePeer({
            initiator: location.hash === '#init',
            trickle: false,
            stream: stream
        });

        // Handle WebRTC signaling
        peer.on('signal', data => {
            socket.emit('offer', data); // Send offer to other users
        });

        socket.on('offer', offer => {
            peer.signal(offer); // Receive offer from other users
        });

        socket.on('answer', answer => {
            peer.signal(answer); // Receive answer from other users
        });

        socket.on('candidate', candidate => {
            peer.signal(candidate); // Receive ICE candidate from other users
        });

        // Handle remote stream
        peer.on('stream', remoteStream => {
            remoteVideo.srcObject = remoteStream;
        });
    })
    .catch(error => {
        console.error('Error accessing media devices:', error);
    });

// Mute/Unmute audio
muteButton.addEventListener('click', () => {
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack.enabled) {
        audioTrack.enabled = false;
        muteButton.textContent = 'Unmute';
    } else {
        audioTrack.enabled = true;
        muteButton.textContent = 'Mute';
    }
});

// Turn camera on/off
cameraButton.addEventListener('click', () => {
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack.enabled) {
        videoTrack.enabled = false;
        cameraButton.textContent = 'Turn On Camera';
    } else {
        videoTrack.enabled = true;
        cameraButton.textContent = 'Turn Off Camera';
    }
});

// Handle chat messages
sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message) {
        socket.emit('chat message', message); // Send chat message to server
        messageInput.value = '';
    }
});

socket.on('chat message', (msg) => {
    const li = document.createElement('li');
    li.textContent = msg;
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight; // Auto-scroll to the latest message
});