// async function fetchSongs() {
//     try {
//         const response = await fetch('http://127.0.0.1:8000/songs');
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const songs = await response.json();
//         console.log(songs)
//     } catch (error) {
//         console.error('There was a problem with the fetch operation:', error);
//     }
// }







    

// fetchSongs()

// // Function to display songs in the frontend
// function displaySongs(songs) {
//     const songsList = document.getElementById('songs-list');
//     songs.forEach(song => {
//         const songElement = document.createElement('div');
//         songElement.innerHTML = `
//             <h3>${song.name}</h3>
//             <p>Singer: ${song.singer}</p>
//             <p>Path: ${song.path}</p>
//             <img src="${song.image}" alt="${song.name} Image" width="100" height="100">
//         `;
//         songsList.appendChild(songElement);
//     });
// }

// // Call the fetchSongs function when the page loads
// document.addEventListener('DOMContentLoaded', () => {
//     fetchSongs();
// });