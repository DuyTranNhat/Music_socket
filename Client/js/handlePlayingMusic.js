// Một số bài hát có thể bị lỗi do liên kết bị hỏng. Vui lòng thay thế liên kết khác để có thể phát
// Some songs may be faulty due to broken links. Please replace another link so that it can be played

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

var courseApi = "http://127.0.0.1:1234/songs";

const PlAYER_STORAGE_KEY = "PLAYER";

var player;
var cd;
var heading;
var cdThumb;
var audio;
var playBtn;
var progress;
var prevBtn;
var nextBtn;
var randomBtn;
var repeatBtn;
var playlist;
var optionE;

function reAddEVent() {
  player = $(".player");
  cd = $(".cd");
  heading = $("header h2");
  cdThumb = $(".cd-thumb");
  audio = $("#audio");
  playBtn = $(".btn-toggle-play");
  progress = $("#progress");
  prevBtn = $(".btn-prev");
  nextBtn = $(".btn-next");
  randomBtn = $(".btn-random");
  repeatBtn = $(".btn-repeat");
  playlist = $(".playlist");
}

document.addEventListener("click", (e) => console.log(e.target));

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: {},
  // (1/2) Uncomment the line below to use localStorage
  // config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
  songs: [],
  songsPlaylist: [],

  fetchSongs: async function () {
    const response = await fetch(courseApi);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const songs = await response.json();
    this.songs = songs;
  },

  setConfig: function (key, value) {
    this.config[key] = value;
    // (2/2) Uncomment the line below to use localStorage
    // localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: async function (start, end, list) {
    // this.songs = list
    const htmls = list.map((song, index) => {
      if (index >= start && index < end) {
      return `
                        <div class="song ${
                          index === this.currentIndex ? "active" : ""
                        }" data-index="${song.id - 1}">
                            <div class="thumb"
                                style="background-image: url('${song.image}')">
                            </div>
                            <div class="body">
                                <h3 class="title">${song.name}</h3>
                                <p class="author">${song.singer}</p>
                            </div>
                      
                            <div class="heart-wrapper" idSong="${song.id}">
                              <i class="bi bi-heart-fill"></i>
                            </div>
                        </div>
                    `;
    }});

    playlist.innerHTML = htmls.join("");
  },

  renderSongsPlaylist: async function (start, end, list) {
    this.songsPlaylist = list
    const htmls = this.songsPlaylist.map((song, index) => {
      if (index >= start && index < end) {
      return `
                        <div class="song ${
                          song.id - 1 === this.currentIndex ? "active" : ""
                        }" data-index="${song.id - 1}">
                            <div class="thumb"
                                style="background-image: url('${song.image}')">
                            </div>
                            <div class="body">
                                <h3 class="title">${song.name}</h3>
                                <p class="author">${song.singer}</p>
                            </div>
                      
                            <div class="heart-wrapper" idSong="${song.id}">
                              <i class="bi bi-heart-fill"></i>
                            </div>
                        </div>
                    `;
    }});

    playlist.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    optionE = $$(".heart-wrapper");
    for (let i = 0; i < optionE.length; i++) {
      optionE[i].addEventListener("click", (e) => {
        e.stopPropagation();
        addSongToPLaylistOverlay.classList.add("open");
        songId = e.currentTarget.getAttribute("idSong");
      });
    }

    // Xử lý CD quay / dừng
    // Handle CD spins / stops
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, // 10 seconds
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // Xử lý phóng to / thu nhỏ CD
    // Handles CD enlargement / reduction
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý khi click play
    // Handle when click play
    var intervalID = null;
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        if (checkRoleEvents()) {
          audio.pause();

          console.log(intervalID);
          //Hủy cập nhập currentTime socket
          // Dừng việc log khi audio tạm dừng
          cancelUpdateIntervalCurrentTimeAudioSockets();

          sio.emit("pauseAudio", user);
        } else {
          let obj = {
            title: "Error",
            message: "You don't have this role",
            color: "red",
          };
          ToastMessage(obj);
          console.log("Don't have role");
        }
      } else {
        if (checkRoleEvents()) {
          audio.play();
          // Lay ra qua trinh bai hat

          if (audio.duration) {
            //Qua trình nhạc
            const progressPercent = Math.floor(
              (audio.currentTime / audio.duration) * 100
            );
            infoSong = {
              progressPercent: progressPercent,
              currentIndex: _this.currentIndex,
            };
          }

          //Chọn nhạc mới (truyền true), nhạc đang phát (truyền false)
          sio.emit("playAudio", user, infoSong, false);

          // // cập nhập currentTime socket chi user nao bam

          addUpdateIntervalCurrentTimeAudioSockets();
        } else {
          let obj = {
            title: "Error",
            message: "You don't have this role",
            color: "red",
          };
          ToastMessage(obj);
          console.log("Don't have role");
        }
      }
    };

    function addUpdateIntervalCurrentTimeAudioSockets() {
      intervalID = setInterval(() => {
        sio.emit("setCurrentTimeSong", { currentTimeAudio: audio.currentTime });
      }, 1000); // Log mỗi giây
    }

    function cancelUpdateIntervalCurrentTimeAudioSockets() {
      clearInterval(intervalID);
    }

    // Khi song được play
    // When the song is played
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi song bị pause
    // When the song is pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    // When the song progress changes
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // Xử lý khi tua song
    // Handling when seek
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
      console.log(seekTime);
    };

    // Khi next song
    // When next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Khi prev song
    // When prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Xử lý bật / tắt random song
    // Handling on / off random song
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Xử lý lặp lại một song
    // Single-parallel repeat processing
    repeatBtn.onclick = function (e) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    // Xử lý next song khi audio ended
    // Handle next song when audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };
    // Lắng nghe hành vi click vào playlist
    // Listen to playlist clicksop
    playlist.onclick = function (e) {
      if (checkRoleEvents()) {
        const songNode = e.target.closest(".song:not(.active)");

        if (songNode || e.target.closest(".option")) {
          // Xử lý khi click vào song
          // Handle when clicking on the song
          if (songNode) {
            // _this.currentIndex = Number(songNode.dataset.index);
            // _this.loadCurrentSong();
            // _this.render();
            // audio.play();

            let currentIndex = Number(songNode.dataset.index);
            infoSong = { progressPercent: 0, currentIndex: currentIndex };

            //Chọn nhạc mới (truyền true), nhạc đang phát (truyền false)
            sio.emit("playAudio", user, infoSong, true);
          }

          // Xử lý khi click vào song option
          // Handle when clicking on the song option
          if (e.target.closest(".option")) {
          }
        }
      } else {
        let obj = {
          title: "Error",
          message: "You don't have this role",
          color: "red",
        };
        ToastMessage(obj);
        console.log("Don't have role");
      }
    };
  },

  addEventJustPlaylist: function () {
    const _this = this;

    playlist.onclick = function (e) {
      if (checkRoleEvents()) {
        const songNode = e.target.closest(".song:not(.active)");

        if (songNode || e.target.closest(".option")) {
          // Xử lý khi click vào song
          // Handle when clicking on the song
          if (songNode) {
            // _this.currentIndex = Number(songNode.dataset.index);
            // _this.loadCurrentSong();
            // _this.render();
            // audio.play();

            let currentIndex = Number(songNode.dataset.index);
            infoSong = { progressPercent: 0, currentIndex: currentIndex };

            //Chọn nhạc mới (truyền true), nhạc đang phát (truyền false)
            sio.emit("playAudio", user, infoSong, true);
          }

          // Xử lý khi click vào song option
          // Handle when clicking on the song option
          if (e.target.closest(".option")) {
          }
        }
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 300);
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  nextSong: function () {
    if (checkRoleEvents()) {
      let nextIndex = this.currentIndex + 1;
      if (this.currentIndex >= this.songs.length) {
        nextIndex = 0;
      }

      infoSong = { progressPercent: 0, currentIndex: nextIndex };

      //Chọn nhạc mới (truyền true), nhạc đang phát (truyền false)
      sio.emit("playAudio", user, infoSong, true);
    } else {
      let obj = {
        title: "Error",
        message: "You don't have this role",
        color: "red",
      };
      ToastMessage(obj);
    }
  },
  prevSong: function () {
    if (checkRoleEvents()) {
      let preIndex = this.currentIndex - 1;

      if (this.currentIndex < 0) {
        preIndex = this.songs.length - 1;
      }

      infoSong = { progressPercent: 0, currentIndex: preIndex };

      //Chọn nhạc mới (truyền true), nhạc đang phát (truyền false)
      sio.emit("playAudio", user, infoSong, true);
    } else {
      let obj = {
        title: "Error",
        message: "You don't have this role",
        color: "red",
      };
      ToastMessage(obj);
    }
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: async function () {
    // Gán cấu hình từ config vào ứng dụng
    // Assign configuration from config to application
    await this.fetchSongs();
    this.loadConfig();

    // Định nghĩa các thuộc tính cho object
    // Defines properties for the object
    this.defineProperties();

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    // Load the first song information into the UI when running the app
    this.loadCurrentSong();

    // Render playlist
    // Lắng nghe / xử lý các sự kiện (DOM events)
    // await this.render();
    await  renderList(10, 1, this.songs,  this.render, "#playlist-socket")

    // Listening / handling events (DOM events)
    this.handleEvents();

    // Hiển thị trạng thái ban đầu của button repeat & random
    // Display the initial state of the repeat & random button
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);
  },
};
