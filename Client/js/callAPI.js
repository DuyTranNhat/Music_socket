function addEventBtnAccessLoginAPI() {
  document
    .getElementById("form-login")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const formdata = document.getElementById("form-login");
      const accountId = formdata.querySelector(".form-control.email").value;
      const password = formdata.querySelector(".form-control.password").value;
      fetchData_renderHome(accountId, password);
      
    });
}

addEventBtnAccessLoginAPI();

async function fetchSongs() {
  const response = await fetch(courseApi);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const songs = await response.json();
  songsData = songs;
}

function fetchData_renderHome(accountId, password) {
  fetch("http://127.0.0.1:1234/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({ accountId, password }),
  })
    // .then(response => {
    //     if (!response.ok) {
    //         throw new Error('Failed to login');
    //     }
    //     return response.json();
    // })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Login failed");
      }
      return response.json();
    })
    .then(async function (data) {
        console.log(data);
      if (!data.ErrorLogin) {
        console.log('oke');
        // app.start();
        // reAddEVent();
        user = data;
        localStorage.setItem(LOCALSTORAGE_USER, user);
        await fetchSongs();
        await fetchPlaylistsUser(user.id);
        await renderHome();
        
        // await renderList(4, 1, songsData, renderSongsOnPage);
        await startSockets()
        
       let obj = { title : 'Successfully!', message: 'Đăng Nhập Thành Công!', color: 'green' }
       ToastMessage(obj)
        return user.id;
    } else {
       let obj = { title : 'Error!', message: data.ErrorLogin, color: 'red' }
       ToastMessage(obj)
      //  ToastMessage(obj)
    }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Login failed. Please try again.");
    });
}

function checkLoginSuccess(data) {
  return data.ErrorLogin === 'undefined';
}

async function fetchPlaylistsUser(userId) {
  fetch(`http://127.0.0.1:1234/user/${userId}/playlists`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    // .then(response => {
    //     if (!response.ok) {
    //         throw new Error('Failed to login');
    //     }
    //     return response.json();
    // })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Login failed");
      }
      return response.json();
    })
    .then(async (playlists) => {
      playlist_user_arr = playlists;
      addOptionSongPlayList()
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Login failed. Please try again.");
    });
}