const contentE = document.getElementById('content-wrapper');
const favoritePageE = document.getElementById('sidebar-favorite')
const musicsPageE = document.getElementById('sidebar-music')
const livePageE = document.getElementById('sidebar-live')
const detectPageE = document.getElementById('sidebar-detect')
const loginWrapper = document.getElementById('login-wrapper')
const addSongToPLaylistOverlay = document.querySelector('.option-playlist-over')
const addPlaylistBox = document.querySelector('.option-playlist-over__wrapper')
const formAddPlaylist = document.getElementById('submitCreatePlaylist')
const addaPlaylistOverlay = document.querySelector('.add-playlist-over')
const selectElement = document.querySelector('#option-addSongToPlaylist-wrapper')
const addSongPlaylistBtn = document.querySelector('#add-song-playlist-btn')


var newApp = null
var songId = 1
var playlistId = 1
var userRoomE = null
var currentLiveRoom = -1

var user_roomLive = null
var room_user_arr = null
var songsData = []

// addPlaylistOverlay
// var user = { id : 1 , accountId : "duytn1006", password : "Asdfgh1052003." }
var user = null
var roleRoom = 'member'
var room_user_arr = []
var playlist_user_arr = []

const LOCALSTORAGE_USER = "LOCALSTORAGE_USER"
const HOST_ROOM = "host"
const MANAGER_ROOM = "manager"
const MEMBER_ROOM = "member"
