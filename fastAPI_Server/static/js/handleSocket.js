var socket = new WebSocket("ws://localhost:8000/ws");

// Function to handle play button click event
function playMusic() {
    socket.send("play");
}

// Function to handle pause button click event
function pauseMusic() {
    socket.send("pause");
}

// Add event listeners to play and pause buttons
document.getElementById(".btn-toggle-play").addEventListener("click", playMusic);
document.getElementById("pauseButton").addEventListener("click", pauseMusic);