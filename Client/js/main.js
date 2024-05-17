function ToastMessage({ title, message, color }) {
  document.querySelector("#titile-toast").innerHTML = title;
  document.querySelector("#titile-toast").style.color = color;
  document.querySelector("#message-toast").innerHTML = message;
  var myToast = new bootstrap.Toast(document.getElementById("toast")).show();
}

async function renderHome() {
  renderSideBar();
  reRenderUserInfo();

  var html = `
  <div class="row" >
<!-- music block -->
  <h1>Nhạc</h1>

  <section id="all-songs-home" class="row d-flex justify-content-center">
    
    <!--song card end-->
  </section>

  <ul id="paging-home" class="pagination mt-4 d-flex justify-content-center" style="z-index: 0; ">
      <li class="page-item"><a href="javascript:void(0);" class="page-link page-prev-btn-comming">PREV</a></li>
      <div class="d-flex number-page-comming">

      </div>
      <li class="page-item"><a href="javascript:void(0);" class="page-link page-next-btn-comming">NEXT</a></li>
  </ul> 
<!-- end category area-->
</div>
`;

  contentE.innerHTML = html;

  // setTimeout(renderSongHome, 100);
  setTimeout(() => {
    renderList(12, 1, songsData, renderSongsOnPage, "#paging-home");
  }, 100)

  // function renderSongHome() {
  //   const htmls = songsData
  //     .map((song, index) => {
  //       return `
  //                       <div class="col-3 d-flex justify-content-center" >
  //                         <div class="w-100 song ${
  //                           index === this.currentIndex ? "active" : ""
  //                         }" data-index="${song.id - 1}">
  //                             <div class="thumb"
  //                                 style="background-image: url('${
  //                                   song.image
  //                                 }')">
  //                             </div>
  //                             <div class="body">
  //                                 <h3 class="title">${song.name}</h3>
  //                                 <p class="author">${song.singer}</p>
  //                             </div>
  //                             <div class="heart-wrapper" idSong="${song.id}">
  //                               <i class="bi bi-heart-fill"></i>
  //                             </div>
  //                         </div>
  //                       </div>
  //                   `;
  //     })
  //     .join("");

  //   document.querySelector("#all-songs-home").innerHTML = htmls;

    
  // }
}

async function searchSongs() {
  const input = document.getElementById("search-input").value;
  if (!input) {
    alert("Please enter a search term");
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:1234/findSongs/${encodeURIComponent(input)}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    songsData = await response.json();
    console.log(songsData);
    renderHome();
  } catch (error) {
    console.error("Error fetching songs:", error);
    alert("Error fetching songs");
  }
}

// async function renderPlaylistHome(playlists) {

//   const htmls = playlists.map((item, index) => {
//     return `
//       <div class="m-4 playlist-home" playlist-id=${item.id} style="width: 200px;">
//         <div style="position: relative;">
//           <img src="${item.image}" class="big-song-img rounded w-100 img-fluid" >
//           <a href="#">
//             <div class="big-song-hover " >
//               <i class="h1 bi bi-play"></i>
//             </div>
//           </a>
//           </div>
//         <div>
//           <div class="lead fw-bold">${item.name}</div>
//           <small class="text-muted">Song ${item.desc}</small>
//         </div>
//       </div>
//     `

//   })

//   const optionAddSogToPL = document.querySelector('#option-addSongToPlaylist-wrapper')

//   optionAddSogToPL.innerHTML = playlists.map((playlist) => {
//     return `<option value="${playlist.id}">${playlist.name}</option>`
//   }).join()

//   sectionPlaylistHome.innerHTML = htmls

//   addEventPlayListItem()
//   addEventForSongsToPLOpt()
// }

function addOptionSongPlayList() {
  const optionAddSogToPL = document.querySelector(
    "#option-addSongToPlaylist-wrapper"
  );

  optionAddSogToPL.innerHTML = playlist_user_arr
    .map((playlist) => {
      return `<option value="${playlist.id}">${playlist.name}</option>`;
    })
    .join();
}

function renderSideBar() {
  const sidebarE = document.querySelector(".wrapper-body");
  sidebarE.classList.add("login--success");
}

function addEventPlayListItem() {
  const playlistHomeItem = document.getElementsByClassName("playlist-home");

  for (let i = 0; i < playlistHomeItem.length; i++) {
    playlistHomeItem[i].addEventListener("click", (e) => {
      const idPlaylist = e.currentTarget.getAttribute("playlist-id");
      getSongsByPlaylist(idPlaylist);
    });
  }
}

function getSongsByPlaylist(playlistId) {
  fetch(`http://127.0.0.1:1234/playlist/${playlistId}/songs`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch songs for playlist");
      }
      return response.json();
    })
    .then((data) => {
      // Xử lý dữ liệu bài hát khi thành công
      // const newApp = Object.create(app);

      // newApp.restart()
      app.songsPlaylist = data;
      renderList(10, 1, app.songsPlaylist,  app.renderSongsPlaylist, "#paging-home")
      app.addEventJustPlaylist();
    })
    .catch((error) => {
      console.error("An error occurred:", error.message);
    });
}

function addEventLoginBtn() {
  const loginBtnE = document.getElementById("login-btn");

  console.log(loginBtnE);

  loginBtnE.addEventListener("click", renderLoginForm);
}

function reRenderUserInfo() {
  if (!user) {
    loginWrapper.innerHTML = `
        <a id="login-btn"class="btn btn-success d-flex align-items-center" ><span>Login Here</span></a>
        `;
    addEventLoginBtn();
  } else {
    loginWrapper.innerHTML = `
        <img
        class="rounded-circle"
        src="images/06.jpg"
        style="width: 40px; height: 40px"
      />
      <li class="nav-item dropdown">
        <a
          class="nav-link dropdown-toggle"
          href="#"
          id="navbarDropdown"
          role="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Hi, ${user.first_name}
        </a>
        <ul
          class="dropdown-menu dropdown-menu-end bg-dark"
          aria-labelledby="navbarDropdown"
        >
          <li>
            <a class="dropdown-item text-white" href="#"
              ><i class="bi bi-person"></i> Profile</a
            >
          </li>
          <li>
            <a class="dropdown-item text-white" href="#"
              ><i class="bi bi-gear"></i> Settings</a
            >
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <a class="dropdown-item text-white" href="#"
              ><i class="bi bi-box-arrow-right"></i> Logout</a
            >
          </li>
        </ul>
      </li> 
        `;
  }
}

reRenderUserInfo();

async function fetchRooms(skip = 0, limit = 100) {
  try {
    const response = await fetch(`http://127.0.0.1:1234/room_user_role`);

    if (!response.ok) {
      throw new Error("Failed to fetch rooms");
    }

    const rooms = await response.json();
    return rooms;
  } catch (error) {
    console.error("Error fetching rooms:", error.message);
    return null;
  }
}

async function handle_render_rooms() {
  let skip = 0;
  let limit = 100;
  await renderRoomLivePage();

  fetchRooms(0, 100)
    .then((rooms) => {
      //Phòng chứa user và phân quyền
      room_user_arr = rooms;
    })
    .then(() => {
      console.log(room_user_arr);
      renderList(4, 1, room_user_arr, renderRoomsOnPage, "#room-paging");
    });
}

function getHostInRoom(userArr) {
  for (let i = 0; i < userArr.length; i++) {
    if (userArr[i].roleRoom === "host") {
      console.log(userArr[i]);
      return userArr[i];
    }
  }
}

function addEvenJoinRoom() {
  const roomLiveE = document.querySelectorAll(".room-item-wrapper");
  for (let i = 0; i < roomLiveE.length; i++) {
    roomLiveE[i].addEventListener("click", (e) => {
      //join room
      let idRoomLive = e.currentTarget.getAttribute("room_user_id");
      sio.emit("join_room", { room_id: idRoomLive }); // reRender
      sio.emit("getCurrentSong"); //
      sio.emit("getCurrentTimeSong");
      const roomBlock = document.querySelector(".live-room-container");
      roomBlock.classList.add("attend");

      //out room
      document
        .querySelector(".btn-out-wrapper")
        .addEventListener("click", () => {
          sio.emit("left_room");
          roomBlock.classList.remove("attend");
          audio.pause();
        });
    });
  }
}

async function renderRoomLivePage() {
  var html = `
  <div class="live-room-container" >
  <div class="row" >
  <div class="col-12 d-flex justify-content-center" > 
  <div class="wrapper-room wrapper-room-list">
  <div class="d-flex justify-content-between align-items-center" >
    <h2 class="my-3" >Rooms</h2>
    <div class="d-flex" >
      <button class="btn btn-success btn-add-room me-2" style="height: 42px; width: 42px;" >
       <i class="fs-bold bi bi-plus-circle"></i>
       <button class="btn btn-danger btn-delete-room" style="height: 42px; width: 42px;" >
       <i class="bi bi-x-circle"></i>
    </div>
  </div>
  <div id='room-user-block' class="user-list">

  </div>

  <div class="add-room-wrapper" >
    <form id="form-new-room" >
    <div class="form-group">
      <label class="add-room-wrapper_title" for="name-new-room">Tên Phòng</label>
      <input class="form-control" id="name-new-room" aria-describedby="emailHelp" placeholder="Bốc cháy mùa hè">

      
    </div>

    <div class="form-group ">
      <button class="btn btn-success mt-2" >Thêm phòng mới</button>
    </div>

    </form>
  </div>

  <ul id="room-paging" class="pagination mt-4 d-flex justify-content-center" style="z-index: 0; ">
      <li class="page-item"><a href="javascript:void(0);" class="page-link page-prev-btn-comming">PREV</a></li>
      <div class="d-flex number-page-comming">

      </div>
      <li class="page-item"><a href="javascript:void(0);" class="page-link page-next-btn-comming">NEXT</a></li>
  </ul>
</div>
  </div>

<!-- music block -->
  <div class="col-3 room-user-col" >
  <div class="wrapper-room wrapper-room-user">
    <h2 class="my-3 wrapper-room__name" >Room Name</h2>
    <div class="btn-out-wrapper btn btn-danger mb-3">Thoát</div>
    <div class="user-list mb-3" id="room-user-wrapper">
      
    </div>
  </div>

  
  
  </div>

<div class="col-5 d-flex justify-content-center room-live-playlist" >
  <div class="player">
    <!-- Dashboard -->
    <div class="dashboard">
      <!-- Header -->
      <header>
        <h4>Now playing:</h4>
        <h2>String 57th & 9th</h2>
      </header>

      <!-- CD -->
      <div class="cd">
        <div
          class="cd-thumb"
          style="
            background-image: url('https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg');
          "
        ></div>
      </div>

      <!-- Control -->
      <div class="control">
        <div class="btn btn-repeat">
          <i class="fas fa-redo"></i>
        </div>
        <div class="btn btn-prev">
          <i class="fas fa-step-backward"></i>
        </div>
        <div class="btn btn-toggle-play">
          <i class="fas fa-pause icon-pause"></i>
          <i class="fas fa-play icon-play"></i>
        </div>
        <div class="btn btn-next">
          <i class="fas fa-step-forward"></i>
        </div>
        <div class="btn btn-random">
          <i class="fas fa-random"></i>
        </div>
      </div>

      <input
        id="progress"
        class="progress"
        type="range"
        value="0"
        step="1"
        min="0"
        max="100"
      />

      <audio id="audio" src=""></audio>
    </div>

    <!-- Playlist -->
    <div class="playlist">
     
    </div>

    <ul id="playlist-socket" class="pagination mt-4 d-flex justify-content-center" style="z-index: 0; ">
    <li class="page-item"><a href="javascript:void(0);" class="page-link page-prev-btn-comming">PREV</a></li>
    <div class="d-flex number-page-comming">

    </div>
    <li class="page-item"><a href="javascript:void(0);" class="page-link page-next-btn-comming">NEXT</a></li>
</ul>
  </div>
</div>
<!-- end music block -->

<!-- start category area-->
<div class="col-4 d-flex" >
  

  <section id="playlist-home" class="pt-2 d-flex justify-content-center" style="flex-wrap: wrap;">
    ${renderPlayListUser(playlist_user_arr)}
    <!--song card end-->
  </section>
</div>
<!-- end category area-->
  </div>
</div>
`;

  contentE.innerHTML = html;

  addEventPlayListItemRoom();
  addEventAddNewRoom();
  addEventOpenModalDeleteRoom()
}

function addEventOpenModalDeleteRoom() {

  const btnDetele = document.querySelector(".btn-delete-room")
  btnDetele.addEventListener('click', e => {
    room_of_user_login = room_user_arr.filter(item => {
      return checkRoomOfUser(item.users)
    })

    rendenRoomInPlaylist(room_of_user_login)
    
    console.log(room_of_user_login);
  })
}

function rendenRoomInPlaylist(room_of_user_login) {
  document.querySelector("#modal-delete-room").classList.add("open")

  html = room_of_user_login.map(item => {
    return `<option value="${item.room_id}" >${item.room_name}</option>`
  })
  document.querySelector("#modal-delete-room__select").innerHTML = html

  addEventDeleteRoom()
}

function addEventDeleteRoom() {
  document.getElementById('delete-room-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Ngăn chặn form gửi thông tin theo cách thông thường

    const selectElement = document.getElementById('modal-delete-room__select');
    const roomId = selectElement.value;

    try {
        const response = await fetch('http://127.0.0.1:1234/delete-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ room_id: roomId }),
        });

        if (response.ok) {
            document.querySelector("#modal-delete-room").classList.remove("open")
            sio.emit("reRender_room_hall", null)
            const result = await response.json();
            let obj = { title : 'Successfully!', message: result.message, color: 'green' }
            ToastMessage(obj)
        } 
    } catch (error) {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi xóa phòng');
    }
});
}

function checkRoomOfUser(room_users) {
  return room_users.find(item => {
      return (item.roleRoom == HOST_ROOM && item.user_id == user.id) 
  })
}

function addEventAddNewRoom() {
  document
    .querySelector("#form-new-room")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      var roomName = document.getElementById("name-new-room").value;

      data = { new_room_name: roomName };

      sio.emit("createNewRoom", data);
    });
}

function addEventPlayListItemRoom() {
  const playlistHomeItem = document.getElementsByClassName("playlist-room");

  for (let i = 0; i < playlistHomeItem.length; i++) {
    playlistHomeItem[i].addEventListener("click", (e) => {
      const idPlaylist = e.currentTarget.getAttribute("playlist-id-room");
      getSongsByPlaylist(idPlaylist);
    });
  }
}

function getSongsByPlaylist(playlistId) {
  fetch(`http://127.0.0.1:1234/playlist/${playlistId}/songs`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch songs for playlist");
      }
      return response.json();
    })
    .then((data) => {
      // Xử lý dữ liệu bài hát khi thành công
      // const newApp = Object.create(app);

      // newApp.restart()
      newApp.songsPlaylist = data;
      renderList(10, 1, newApp.songsPlaylist, newApp.renderSongsPlaylist, "#playlist-socket")
      newApp.addEventJustPlaylist();
    })
    .catch((error) => {
      console.error("An error occurred:", error.message);
    });
}

var addEventForSongsToPLOpt = function () {
  // Lắng nghe sự kiện khi có sự thay đổi trong dropdown
  selectElement.addEventListener("change", function () {
    // Lấy giá trị của phần tử được chọn
    playlistId = selectElement.value;
    // Hiển thị giá trị của phần tử được chọn (ví dụ: in ra console)
    //lay ra playlist
  });
};

function renderPlayListUser(playlist_user_arr) {
  return playlist_user_arr
    .map((playlist_user, index) => {
      return `
    <div  playlist-id-room=${playlist_user.id} class="playlist-room m-4" style="width: 200px;">
    <div style="position: relative;">
      <img src="${playlist_user.image}" class="big-song-img rounded w-100 img-fluid" >
      <a href="#">
        <div class="big-song-hover " >
          <i class="h1 bi bi-play"></i>
        </div>
      </a>
      </div>
    <div>
      <div class="lead fw-bold">${playlist_user.name}</div>
      <small class="text-muted">Song ${playlist_user.desc}</small>
    </div>
  </div>
    `;
    })
    .join("");
}

livePageE.addEventListener("click", async (e) => {
  handle_render_rooms();
  reAddEVent();
  newApp = Object.create(app);
  newApp.start();

  addEventAddRoom();
});

detectPageE.addEventListener("click", async (e) => {
  renderInstruction();
  sio.emit("left_room");
  roomBlock.classList.remove("attend");
  audio.pause();
});

musicsPageE.addEventListener("click", async (e) => {
  await fetchPlaylistsUser(user.id);
  await renderHome()
  renderList(4, 1, songsData, renderSongsOnPage, "#paging-home");
  sio.emit("left_room");
  roomBlock.classList.remove("attend");
  audio.pause();
});

function addEventAddRoom() {
  const addRoomBtn = document.querySelector(".btn-add-room");
  addRoomBtn.addEventListener("click", () => {
    const addRoomForm = document.querySelector(".add-room-wrapper");
    addRoomForm.classList.toggle("open");
  });
}

// xử lý phân trang
async function renderList(perpage, currentPage, list, renderListOnPage, keyId) {
  var numberPage = document.querySelector(`${keyId}`);
  numberPage.innerHTML = '';

  let start = (currentPage - 1) * perpage;
  let end = currentPage * perpage;

  function addEventPage() {
    // const divElement = document.que  rySelector(".d-flex.number-page-comming");
    const currentPages = numberPage.querySelectorAll("li");
    for (let i = 0; i < currentPages.length; i++) {
      currentPages[i].addEventListener("click", () => {
        currentPage = i + 1;
        updateStartEnd(currentPage);
        renderPaging();
        renderListOnPage(start, end, list);
      });
    }
  }

  function updateStartEnd(currentPage) {
    start = (currentPage - 1) * perpage;
    end = currentPage * perpage;
  }

  function renderPaging() {
    let html = ``;
    let soTrang = Math.ceil(list.length / perpage);

    for (let i = 1; i <= soTrang; i++) {
      i == currentPage
        ? (html += `<li class="active page-item"><a href="javascript:void(0);" class="page-link">${i}</a></li>`)
        : (html += `<li class="page-item"><a href="javascript:void(0);" class="page-link">${i}</a></li>`);
    }
    numberPage.innerHTML = html;
    setTimeout(addEventPage, 100);
  }

  renderPaging();
  renderListOnPage(start, end, list);
}

function renderSongsOnPage(start, end, list) {
  html = "";
  const contentOfSong = list.map((item, index) => {
    if (index >= start && index < end) {
      html += `<div class="col-3 d-flex justify-content-center">
                <div class="w-100 song ${
                  index === this.currentIndex ? "active" : ""
                }" data-index="${item.id - 1}">
                  <div class="thumb" style="background-image: url('${
                    item.image
                  }')">
                  </div>

                  <div class="body">
                    <h3 class="title">${item.name}</h3>
                    <p class="author">${item.singer}</p>
                  </div>

                  <div class="heart-wrapper" idSong="${item.id}">
                    <i class="bi bi-heart-fill"></i>
                  </div>
                </div>
              </div>`;
    }
    return html;
  });
  document.querySelector("#all-songs-home").innerHTML = html;

  setTimeout(() => {
    optionE = $$(".heart-wrapper");
    for (let i = 0; i < optionE.length; i++) {
      optionE[i].addEventListener("click", (e) => {
        e.stopPropagation();
        addSongToPLaylistOverlay.classList.add("open");
        songId = e.currentTarget.getAttribute("idSong");
      });
    }
  }, 100);
}

function renderRoomsOnPage(start, end, list) {
  html = "";
  const contentOfSong = list.map((item, index) => {
    let userHost = getHostInRoom(item.users);
    if (index >= start && index < end) {
      html += `<div class="user-item-wrapper room-item-wrapper" room_user_id=${item.room_id} >
              <img class="user-item__img" src="images/wave.gif" />
              <div class="d-flex flex-column">
                <span class="fw-bold title">${item.room_name}</span>
                <span class="fw-bold">Host Room: ${userHost.user_first_name}</span>
              </div>
            </div>`;
    }
    return html;
  });
  document.querySelector("#room-user-block").innerHTML = html;
  addEvenJoinRoom();
}
// hết xử lý phân trang

