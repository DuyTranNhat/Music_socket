function renderLoginForm() {
  html = `
<div class="main">

<form action="" method="POST" class="form" id="form-1">
  <div class="spacer"></div>

  <div class="form-group">
    <label for="fullname" class="form-label">Tên đầy đủ</label>
    <input id="fullname" name="fullname" type="text" placeholder="VD: Sơn Đặng" class="form-control">
    <span class="form-message"></span>
  </div>

  <div class="form-group">
    <label for="email" class="form-label">Email</label>
    <input name="email" type="text" placeholder="VD: email@domain.com" class="form-control email">
    <span class="form-message"></span>
  </div>

  <div class="form-group">
    <label for="password" class="form-label">Mật khẩu</label>
    <input class="password" name="password" type="password" placeholder="Nhập mật khẩu" class="form-control">
    <span class="form-message"></span>
  </div>

  <div class="form-group">
    <label for="password_confirmation" class="form-label">Nhập lại mật khẩu</label>
    <input id="password_confirmation" name="password_confirmation" placeholder="Nhập lại mật khẩu" type="password" class="form-control">
    <span class="form-message"></span>
  </div>

  <div class="form-group form-group--row">
    <label class="form-label">Giới tính</label>
    <div class="gender-block">
      <div class="option-radio">
        <input type="radio" name="gender" value="male">Nam
      </div>
      <div class="option-radio">
        <input type="radio" name="gender" value="female">Nữ
      </div>
      <div class="option-radio">
        <input type="radio" name="gender" value="female">Nữ
      </div>
    </div>
    
  </div>

  <button class="form-submit">Đăng ký</button>
</form>

<form action="" method="POST" class="form" id="form-login">

  <div class="spacer"></div>

  <div class="form-group">
    <label for="email" class="form-label">Email</label>
    <input rules="require|email" name="email" type="text" placeholder="VD: email@domain.com" class="form-control email">
    <span class="form-message"></span>
  </div>

  <div class="form-group">
    <label for="password" class="form-label">Mật khẩu</label>
    <input rules="require|min:6" name="password" type="password" placeholder="Nhập mật khẩu" class="form-control password">
    <span class="form-message"></span>
  </div>

  <button id="btn" class="form-submit">Đăng nhập</button>
</form>
</div>
`;

  contentE.innerHTML = html;

  addEventBtnAccessLoginAPI();
}

async function renderPlaylistPage() {
  const html = `
  <section class="pt-2 d-flex justify-content-center" style="flex-wrap: wrap;">
  <!--song card start-->
  ${playlist_user_arr.map((playlist_user) => {
    return `
    <div class="m-4 playlist-to-songs" style="width: 200px;" id-playlist=${playlist_user.id}>
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
  })}

  <div class="m-4 bg-add-playlist" >
      <div style="position: relative;">
        <span class="icon-addplaylist-wrapper" >
          <i class="bi bi-plus-circle-fill"></i>
        </span>
      </div>
      
    </div>
  <!--song card end-->
</section>
  `;
  contentE.innerHTML = html;

  const btnAddPlaylist = document.querySelector(".bg-add-playlist");
  btnAddPlaylist.addEventListener("click", (e) => {
    addaPlaylistOverlay.classList.add("open");
  });
}

async function addEventPlaylistPage() {
  const addPlaylistE = document.getElementsByClassName(
    "icon-addplaylist-wrapper"
  );
  addPlaylistE.addEventListener("click", (e) => {
    sio.emit("playAudio", user, infoSong, false);
  });
}

favoritePageE.addEventListener("click", async () => {
  await renderPlaylistPage();
  addEventToRenderPlaylist();
  sio.emit("left_room");
  roomBlock.classList.remove("attend");
  audio.pause();
});

function addEventDeleteRoomModel() {
  const modelDelete =  document.querySelector("#modal-delete-room")
  modelDelete.addEventListener('click', e => {
    modelDelete.classList.remove("open")
  })
  document.querySelector("#modal-delete-room__wrapper").addEventListener('click', e => e.stopPropagation())
}

addEventDeleteRoomModel()

async function addEventToRenderPlaylist() {
  const playListToSongE = document.querySelectorAll(".playlist-to-songs");
  for (let i = 0; i < playListToSongE.length; i++) {
    playListToSongE[i].addEventListener("click", async (e) => {
      const idPlayList = e.currentTarget.getAttribute("id-playlist");
      console.log(idPlayList);
      try {
        const modalPLtoSongsE = document.querySelector("#modal-playlist-songs");
        if (!modalPLtoSongsE.classList.contains("open")) {
          modalPLtoSongsE.classList.add("open");
        }
        const idPlayList = e.currentTarget.getAttribute("id-playlist");
        const songs = await fetchSongsByPlaylistId(idPlayList);
        // Xử lý dữ liệu bài hát ở đây
        renderSongsByPlaylist(songs, idPlayList);
      } catch (error) {
        // Xử lý lỗi ở đây
        console.error("Error fetching songs:", error);
      }
    });
  }
}

function addEventOffModalPLSong() {
  const arrRowPlSongs = document.querySelector("#modal-playlist-songs > .row");
  arrRowPlSongs.addEventListener("click", (e) => e.stopPropagation());

  const modalPLtoSongsE = document.querySelector("#modal-playlist-songs");
  modalPLtoSongsE.addEventListener("click", (e) => {
    const modalPLtoSongsE = document.querySelector("#modal-playlist-songs");
    if (modalPLtoSongsE.classList.contains("open")) {
      modalPLtoSongsE.classList.remove("open");
    }
  });
}

async function renderSongsByPlaylist(songs, idPlayList) {
  let html = `
      <div class="row" style="
      padding-left: 80px;
      padding-right: 80px;
      margin-top: 80px;
  ">
    <!-- music block -->
      <h1 class="" style="color: #fff" style="margin-top: 12px" >Danh sách nhạc</h1>

      <section id="all-songs-home" class="row d-flex justify-content-center">
         ${await handleRenderSongs(songs, idPlayList)} 
      </section>
    <!-- end category area-->
    </div>
`;

  document.querySelector("#modal-playlist-songs").innerHTML = html;

  addEventRemoveSong();
  addEventOffModalPLSong();
}

async function handleRenderSongs(songsData, idPlayList) {
  return songsData
    .map((song, index) => {
      return `
                        <div class="col-3 d-flex justify-content-center song-pl-detail" style="margin-top: 12px" >
                          <div class="w-100 song ${
                            index === this.currentIndex ? "active" : ""
                          }" data-index="${song.id - 1}">
                              <div class="thumb"
                                  style="background-image: url('${
                                    song.image
                                  }')">
                              </div>
                              <div class="body">
                                  <h3 class="title">${song.name}</h3>
                                  <p class="author">${song.singer}</p>
                              </div>
                              <buuton class="btn btn-danger delete-songs-btn" id="confirm-close-songPL" idSong="${
                                song.id
                              }" idPlayListRemove=${idPlayList} data-bs-toggle="modal" data-bs-target="#exampleModal">
                                Xóa
                              </buuton>
                          </div>
                        </div>
                    `;
    })
    .join("");
}

function addEventRemoveSong() {
  const arrDelete = document.querySelectorAll(".song-pl-detail");

  for (let i = 0; i < arrDelete.length; i++) {
    arrDelete[i].addEventListener("click", (e) => {
      const btnDelete = e.currentTarget.querySelector(".delete-songs-btn");
      const idSongDL = btnDelete.getAttribute("idSong");
      const idPlaylistDL = btnDelete.getAttribute("idPlayListRemove");
      document
        .querySelector("#confirm-delete-songPL")
        .addEventListener("click", (e) => {
          deleteSongInPLAPI(idSongDL, idPlaylistDL);
          document.querySelector("#confirm-close-songPL").click();
        });
    });
  }
}

async function deleteSongInPLAPI(idSongDL, idPlaylistDL) {
  try {
    const response = await fetch(
      `http://127.0.0.1:1234/deleteSongsInPList/${idSongDL}/${idPlaylistDL}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const songs = await fetchSongsByPlaylistId(idPlaylistDL);
    renderSongsByPlaylist(songs, idPlaylistDL);

    let obj = {
      title: "Successfully!",
      message: "Song successfully deleted from playlist",
      color: "green",
    };

    ToastMessage(obj);
  } catch (error) {
    let obj = {
      title: "Error!",
      message: "Error: Could not delete song from playlist.",
      color: "red",
    };
    ToastMessage(obj);
  }
}

async function fetchSongsByPlaylistId(playlistId) {
  try {
    const response = await fetch(
      `http://127.0.0.1:1234/playlist/${playlistId}/songs`
    );
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to fetch songs: ${errorMessage}`);
    }
    const songs = await response.json();
    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
    throw error;
  }
}

addSongToPLaylistOverlay.addEventListener("click", () => {
  console.log("123");
  addSongToPLaylistOverlay.classList.remove("open");
});

addPlaylistBox.addEventListener("click", (e) => {
  e.stopPropagation();
});

document
  .querySelector(".add-playlist-over__wrapper")
  .addEventListener("click", (e) => {
    e.stopPropagation();
  });

addaPlaylistOverlay.addEventListener;
addaPlaylistOverlay.addEventListener("click", () => {
  addaPlaylistOverlay.classList.remove("open");
});

//Thêm song vào playlist
addSongPlaylistBtn.addEventListener("click", () => {
  console.log(songId, playlistId);
  var selectElement = document.getElementById(
    "option-addSongToPlaylist-wrapper"
  );
  playlistId = selectElement.options[selectElement.selectedIndex].value;
  addSongToPlaylist(songId, playlistId);
});

//Hàm thêm song vào playlist
async function addSongToPlaylist(songId, playlistId) {
  const url = `http://127.0.0.1:1234/playlist/${playlistId}/song/${songId}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to add song to playlist");
    }

    const responseData = await response.json();
    if (responseData.ErrorNotAvailable) {
      let obj = {
        title: "Error!",
        message: responseData.ErrorNotAvailable,
        color: "red",
      };
      ToastMessage(obj);
    } else if (responseData.message) {
      let obj = {
        title: "Successfully!",
        message: responseData.message,
        color: "green",
      };
      ToastMessage(obj);
    }
  } catch (error) {
    if (error.message === "Song already exists in playlist") {
      // Nếu lỗi liên quan đến unique key (khóa duy nhất), thông báo rằng bài hát đã tồn tại trong playlist
      // alert("Error: Song already exists in playlist");
    } else {
      // Xử lý các loại lỗi khác
      console.error("An error occurred:", error.message);
    }
  }
}

formAddPlaylist.addEventListener("click", (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", document.getElementById("playlistName").value);
  formData.append("desc", document.getElementById("playlistDescription").value);
  let playlistImage = document.getElementById("playlistImage").files[0];
  formData.append("image", playlistImage);
  console.log(formData);

  if (!playlistImage) {
    alert("Vui lòng chọn một file hình ảnh.");
    return;
  }

  // Kiểm tra loại file
  if (!playlistImage.type.startsWith("image/")) {
    alert("Chỉ chấp nhận file hình ảnh.");
    return;
  }

  // Kiểm tra kích thước file (đơn vị byte)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (playlistImage.size > maxSize) {
    alert("Kích thước file không được vượt quá 5MB.");
    return;
  }

  // Nếu dữ liệu hình ảnh hợp lệ, bạn có thể tiếp tục xử lý dữ liệu ở đây

  fetch(`http://127.0.0.1:1234/users/${user.id}/playlists/`, {
    method: "POST",

    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to create playlist");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Playlist created successfully:", data);
      // Xử lý phản hồi thành công tại đây (ví dụ: hiển thị thông báo)
    })
    .catch((error) => {
      console.error("Error creating playlist:", error);
      // Xử lý lỗi tại đây (ví dụ: hiển thị thông báo lỗi)
    });
});

function checkRoleEvents() {
  return roleRoom == "manager" || roleRoom == "host";
}


function renderInstruction() {
  // containerInstruction.classList.add("d-flex justify-content-center");

  // Tạo nội dung cho div
  const innerHTML = `
  <div class="d-flex align-items-center flex-column" >
    <div class="col-md-8 d-flex justify-content-center">
    <div class="jumbotron jumbotron-fluid yolo-section">
      <div class="yolo-container container">
        <h1>Giới thiệu về YOLO</h1>
        <p>"YOLO" là viết tắt của cụm từ tiếng Anh "You Only Look Once" - một mô hình nhận dạng và phân
          loại đối tượng trong hình ảnh và video. Mô hình này nổi tiếng với việc thực hiện nhận dạng đối
          tượng với tốc độ rất nhanh, bằng cách sử dụng một mạng nơ-ron tích chập (CNN) để dự đoán các hộp
          giới hạn và nhãn cho các đối tượng trong một hình ảnh hoặc video. Trong Python, có các thư viện
          và frameworks như OpenCV hoặc TensorFlow có thể được sử dụng để triển khai và sử dụng mô hình YOLO.</p>
        <div class="container-content container bg-white">
          <dl>
            <h4>Giới thiệu chung về YOLOv8</h4>
            <dd>YOLOv8 là một mô hình tiên tiến và hiện đại trong lĩnh vực nhận diện đối tượng (object detection) và
              các nhiệm vụ liên quan đến thị giác máy tính. Nó xây dựng trên thành công của các phiên bản YOLO trước đó
              và giới thiệu các tính năng mới cùng với cải tiến để nâng cao hiệu suất và tính linh hoạt.</dd>
            <ul>
              <li>Tốc độ nhanh: YOLOv8 được thiết kế để hoạt động nhanh chóng, giúp tiết kiệm
                thời gian trong việc xử lý hình ảnh và video.</li>
              <li>Dễ sử dụng: YOLOv8 được thiết kế để dễ dàng triển khai và sử dụng, là lựa chọn
                tốt cho nhiều nhiệm vụ như nhận diện đối tượng, theo dõi, phân đoạn thể hiện, phân loại ảnh và ước tính vị trí.</li>
              <li>Độ chính xác cao: Mô hình này đạt được độ chính xác ấn tượng trong việc phát hiện đối tượng.</li>
              <li>Đã được huấn luyện và đánh giá trên tập dữ liệu COCO (Common Objects in Context). Tập dữ liệu COCO nổi tiếng với sự đa dạng và phức tạp, bao gồm hình ảnh với nhiều loại đối tượng và cảnh quan khác nhau.</li>
            </ul>
            <dd class="font-italic">Dự án này, đã sử dụng Pre-trained model yolov8n để detect object. YOLOv8 Nano là một
              phiên bản nhỏ gọn của mô hình YOLOv8, được phát triển bởi Ultralytics. Dựa trên thành công của các phiên
              bản YOLO trước đó, YOLOv8 Nano giới thiệu các cải tiến và tính năng mới để tối ưu hiệu suất và linh hoạt.</dd>
            <dd>Hãy khám phá và tận dụng tài nguyên từ YOLOv8 để giải quyết các vấn đề liên quan đến thị giác máy tính! 🚀</dd>
            <h4>Hướng dẫn sử dụng</h4>
            <ul>
              <li>Đầu tiên, bạn cần chọn cho mình một video muốn nhận dạng, sau đó bấm <kbd>Upload</kbd><p class="font-italic">
                (*Lưu ý: phần mở rộng video phải là mp4/avi, và thời lượng video nên dưới 1 phút để
                quá trình nhận dạng không mất nhiều thời gian)</p>
                <img src="images/guide1.png" alt="ảnh hướng dẫn" class="guide-img">
              </li>
              <li>Hệ thống sẽ hiển thị video bạn vừa upload qua hình thức Streaming. Lúc này bạn có thể nhấn vào nút <kbd>Detect Video</kbd>
                trên màn hình để hiển thị tùy chọn nhận dạng
                <img src="images/guide2.png" alt="ảnh hướng dẫn" class="guide-img">
              </li>
              <li>Tại đây bạn có thể chọn những <kbd>object</kbd> muốn nhận dạng trong video. Bạn có thể nhấn vào nút <kbd>Chọn tất cả</kbd> để chọn hết các tùy chọn
                <img src="images/guide3.png" alt="ảnh hướng dẫn" class="guide-img">
              </li>
              <li>Ngoài ra, bạn có thể chọn <kbd>Xóa tất cả</kbd> để hủy các tùy chọn trước đó
                <img src="images/guide4.png" alt="ảnh hướng dẫn" class="guide-img">
              </li>
              <li>Sau khi đã chọn xong các tùy chọn muốn nhận dạng trong video, bạn có thể nhấn vào nút <kbd>Bắt đầu!</kbd> để bắt đầu tiến trình nhận dạng.
                <p class="font-italic">
                  (*Lưu ý: bạn phải chọn ít nhất một object để nhận dạng trong video của mình!)</p>
                <img src="images/guide5.png" alt="ảnh hướng dẫn" class="guide-img">
              </li>
              <li>Quá trình nhận dạng sẽ diễn ra trong ít phút, bạn có thể chờ đợi nhận dạng video hoặc hủy tiến trình bằng cách nhấn vào nút <kbd>HỦY</kbd>
                <img src="images/guide6.png" alt="ảnh hướng dẫn" class="guide-img">
              </li>
              <li>Sau khi kết thúc tiến trình, video của bạn đã được nhận dạng. Lúc này bạn có thể tải video nhận
                dạng về bằng cách nhấn vào nút <kbd>Download</kbd> hoặc có thể nhấn vào nút <kbd>Back</kbd> để trở về
                <img src="images/guide7.png" alt="ảnh hướng dẫn" class="guide-img">
              </li>
            </ul>
          </dl>
        </div>
      </div>
    </div>
    </div>

    <div class="col-md-8 container border">
          <h1>Video Streaming</h1>
          <kbd>Chọn một video</kbd>
          <form method="POST" id="uploadForm" enctype="multipart/form-data">
              <div class="form-group">
                  <input type="file" class="form-control" id="video" name="video" accept="video/*">
              </div>
              <div class="form-group">
                  <input type="submit" class="form-control bg-info text-white" value="Upload">
              </div>
          </form>

      <div id="video-wrapper" ></div>
      <div id="detect-option"></div>
      <div id="download-wrapper"></div>
   </div>

  
  `;

  contentE.innerHTML = innerHTML
  renderUploadEvent()
  
  // Tìm đến phần tử ul có id là 'guide-list'
  // const ulElement = document.getElementById("guide-list");
  
}
