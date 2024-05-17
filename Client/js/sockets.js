var sio = null;

function startSockets() {
  sio = io("http://127.0.0.1:1234", { path: "/sockets" });
  sio.on("connect", () => {
    sio.emit("setUserInfo", { user_id: user.id });
  });

  sio.on("chat", (data) => {
    console.log(data);
  });

  sio.on("playAudio", (data) => {
    console.log(data.user.first_name + " is already playing music!");
    console.log(data);
    audio.play();
  });

  sio.on("pauseAudio", (data) => {
    console.log(data.user.first_name + " is already pausing music!");
    console.log(data);
    audio.pause();
  });

  sio.on("reRender_room_hall", (data) => {
    livePageE.click();
  });

  sio.on("reRender_room", (data) => {
    setTimeout(() => {
      const userItemInRoomE = document.querySelectorAll(".user-item-wrapper");

      console.log(data.id);

      //cap nhap quyen cua user trong room
      for (let i = 0; i < userItemInRoomE.length; i++) {
        const idOfUserTag = userItemInRoomE[i].getAttribute("idOfUserInRoom");
        if (idOfUserTag == data.id) {
          userItemInRoomE[i].querySelector(".role-user").innerText =
            data.roleUser;
        }
      }
    }, 200);

    if (user.id == data.id) roleRoom = data.roleUser;
    console.log(roleRoom);
  });

  sio.on("join_room", (data) => {
    //Hien thong bao user tham gia
    //render user tham gia room
    let obj = {
      title: "info",
      message: data.nameUserJoin + " vừa tham gia phòng!",
      color: "#0d6efd",
    };
    ToastMessage(obj);
    reRenderUserInRoomSockets(data);
  });

  // sio.emit('getCurrentSong')
  // sio.eimit('getCurrentTimeSong')

  sio.on("left_room", (data) => {
    //Hien thong bao user tham gia
    //render user tham gia room
    let obj = {
      title: "info",
      message: data.nameUserJoin + " vừa thoát phòng!",
      color: "#0d6efd",
    };
    ToastMessage(obj);
    reRenderUserInRoomSockets(data);
  });

  sio.on("kickUser", data => {
    console.log(data);
    // data = { idKick, 'host': user.first_name }
    if(data.idKick == user.id) {
      const roomBlock = document.querySelector(".live-room-container");
      sio.emit("left_room");
      roomBlock.classList.remove("attend");
      audio.pause();
    }
    setTimeout(() => {
      let obj = {
        title: "info",
        message: data.host + " vừa kích " + user.first_name + " khỏi phòng!",
        color: "#0d6efd",
      };
      ToastMessage(obj);
    }, 100)
  })

  sio.on("getCurrentSong", async (data) => {
    console.log(data);
    currentSongInfo = data.currentSong_dict;
    if (currentSongInfo.currentIndex && currentSongInfo.currentIndex > 0) {
      newApp.currentIndex = currentSongInfo.currentIndex;
      newApp.loadCurrentSong();
      await renderList(10, 1, newApp.songs, newApp.render, "#playlist-socket");
      newApp.handleEvents();
      progress.value = currentSongInfo.progressPercent;
    }
  });

  sio.on("chooseAnotherSong", async (data) => {
    console.log(data);
    currentSongInfo = data.currentSong_dict;
    if (currentSongInfo.currentIndex && currentSongInfo.currentIndex > 0) {
      await renderList(10, 1, newApp.songs, newApp.render, "#playlist-socket");
      newApp.currentIndex = currentSongInfo.currentIndex;
      newApp.loadCurrentSong();
      progress.value = currentSongInfo.progressPercent;
      audio.src = newApp.currentSong.path;
      audio.play();
    }
  });

  sio.on("getCurrentTimeSong", (data) => {
    console.log(data);
    if (data.currentTimeAudio) {
      console.log(data.currentTimeAudio);
      audio.currentTime = data.currentTimeAudio;
      console.log(data.isPlaying);
      if (data.isPlaying) audio.play();
    }
  });

  sio.on("renderCreateRoom", () => {
    document.querySelector("#sidebar-live").click();
  });

  // socketIds.forEach(function(sid) {
  //     sio.to(sid).emit('custom_event', data);
  // });

  async function reRenderUserInRoomSockets(data) {
    console.log(data);
    const roomUsersE = document.getElementById("room-user-wrapper");

    let room = data.room;

    // roomE.querySelector('.wrapper-room__host').innerHTML = `Host ${room.}`
    const element = document.querySelector(".wrapper-room__name");

    if (element) {
      element.innerText = `Room: ${room.name}`;
    } else {
      console.log("Không tìm thấy phần tử có class 'wrapper-room__name'");
    }

    let userInRoomArr = data.listUser;

    //updateRole khi vào room mới
    userInRoomArr.forEach((userInRoom) => {
      updateRoleInRoom(userInRoom);
    });

    userInRoohtml = userInRoomArr.map((userInRoom, index) => {
      return `
        <div class="p-3 user-item-wrapper d-flex" idOfUserInRoom='${
          userInRoom.id
        }' >
            <img class="user-item__img me-3" src="images/wave.gif" />
            <div class="d-flex flex-column" >
                <span class="fw-bold title">${userInRoom.first_name}</span>
                ${getRoleUserInRoom(userInRoom.roleRoom)} 
            </div>

            ${renderSettingRoleUser(userInRoom)}
        </div>
        `;
    });

    

    setTimeout(() => {
      addEventOpenAsignRole();
      addEventAsignRoleUser();
      addEventKick();
    }, 500);

    function addEventKick() {
      const arrBtnKick = document.querySelectorAll(".btn-kick");
    for (let i = 0; i < arrBtnKick.length; i++) {
      arrBtnKick[i].addEventListener("click", (e) => {
        console.log(e.currentTarget);
        const idKick = e.currentTarget.getAttribute("iduserkick");
        console.log("idKick", idKick);
        
        data = { idKick, 'host': user.first_name }
        sio.emit("kickUser", data);
      });
    }
    }

    function addEventOpenAsignRole() {
      const asignRoleArrE = document.querySelectorAll(".asign-role-wrapper");
      console.log(asignRoleArrE);

      for (let i = 0; i < asignRoleArrE.length; i++) {
        asignRoleArrE[i].addEventListener("click", (e) => {
          e.currentTarget.classList.toggle("open");
        });
      }
    }

    console.log(roleRoom);

    roomUsersE.innerHTML = userInRoohtml;

    function updateRoleInRoom(userInRoom) {
      if (userInRoom.id == user.id)
        if (userInRoom.roleRoom) roleRoom = userInRoom.roleRoom;
        else roleRoom = MEMBER_ROOM;
    }

    function renderSettingRoleUser(userInRoom) {
      if (roleRoom == HOST_ROOM && userInRoom.id != user.id) {
        return `<span class="btn btn-success asign-role-wrapper me-2 p-2" style="margin-left: auto;">  
    <i class="bi bi-sliders"></i>
    <ul class="asign-role-wrapper__option" >
    <li class="asign-role-title" >Phân Quyền</li>
    <li class="asign-role-item" idUser="${userInRoom.id}" value-role="${MANAGER_ROOM}" >Quản Lý</li>
    <li class="asign-role-item" idUser=${userInRoom.id} value-role="${MEMBER_ROOM}" >Thành Viên</li>
    </ul>
    </span>
    <button class="btn btn-danger btn-kick" iduserkick="${userInRoom.id}" >kick</button>
    `;
      }
      return ``;
    }

    function addEventAsignRoleUser() {
      const asignRoleItem = document.querySelectorAll(".asign-role-item");

      for (let i = 0; i < asignRoleItem.length; i++) {
        asignRoleItem[i].addEventListener("click", (e) => {
          const idUser = e.currentTarget.getAttribute("idUser");
          const roleUpdate = e.currentTarget.getAttribute("value-role");
          sio.emit("updateRoleUser", { user_id: idUser, roleUser: roleUpdate });
        });
      }
    }

    function getRoleUserInRoom(roleRoom) {
      if (roleRoom) return `<span class="fw-bold role-user">${roleRoom}</span>`;
      return `<span class="fw-bold role-user">Member</span>`;
    }
  }
}
