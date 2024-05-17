// window.onload =

function addDetectBtn() {
  var modal = document.getElementById("modal");
  var detectVideoLink = document.getElementById("detect_video");
  
  if (modal && detectVideoLink) {
    detectVideoLink.onclick = function () {
      inputs = document.querySelectorAll(".form-detection-type input");
      var isChecked = false;
      inputs.forEach(function (element) {
        if (element.checked) {
          isChecked = true;
        }
      });
      if (isChecked) {
        modal.style.display = "block";
        postIsCancelled(false);
        detectVideo();
        postClassNames();

        // modal.style.display = "none"

        // get_frame_count(render_estimated_time);
      } else {
        alert("Vui lòng chọn ít nhất một object");
      }
    };
    //
  }
}

function addEventDownload() {
  document
    .getElementById("downloadButton")
    .addEventListener("click", async function () {
      try {
        const response = await fetch("http://127.0.0.1:1234/download");
        const blob = await response.blob();

        // Tạo một URL cho dữ liệu blob
        const url = window.URL.createObjectURL(blob);

        // Tạo một thẻ <a> để tải xuống
        const a = document.createElement("a");
        a.href = url;
        a.download = "videoDetected.mp4"; // Tên tệp video sẽ được tải xuống

        // Thêm thẻ <a> vào DOM và kích hoạt sự kiện click để bắt đầu tải xuống
        document.body.appendChild(a);
        a.click();

        // Loại bỏ thẻ <a> sau khi tải xuống hoàn thành
        document.body.removeChild(a);

        // Giải phóng URL để giải phóng bộ nhớ
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading video:", error);
      }
    });
}

function ToastMessage({ title, message, color }) {
  document.querySelector("#titile-toast").innerHTML = title;
  document.querySelector("#titile-toast").style.color = color;
  document.querySelector("#message-toast").innerHTML = message;
  var myToast = new bootstrap.Toast(document.getElementById("toast")).show();
}

async function detectVideo() {
  fetch("http://127.0.0.1:1234/detectVideo")
    .then((response) => {
      if (!response.ok) {
        let obj = { title: "Error!", message: "Network response was not ok", color: "red" };
        ToastMessage(obj);
        throw new Error("Network response was not ok");
      }
      return response.json(); // Chuyển đổi response thành JSON
    })
    .then((data) => {
      // console.log(data);
      if (data.isCompleteDetected) {
        let modal = document.getElementById("modal");
        modal.style.display = "none";
        let obj = { title: "Successfully!", message: data.message, color: "green" };
        streamingVideo();
        ToastMessage(obj);
        addDownloadButton()
      }
      console.log("Detection video response:", data);
    })
    .catch((error) => {
      console.error("Error detecting video:", error);
    });
}


function addDownloadButton() {

  document.querySelector("#download-wrapper").innerHTML = 
    `
      <button  class="btn btn-success" id="downloadButton">Download</button>
     `

  addEventDownload()
}


function url_direct(element) {
  window.location.href = element.getAttribute("url");
}

// function get_frame_count(callback) {
//   fetch("http://127.0.0.1:1234/get_frame_count")
//     .then((response) => response.json())
//     .then(callback);
// }

// function render_estimated_time(data) {
//   console.log(data);
//   var frameCount = data["frame_count"];
//   var totalTime = Math.floor(frameCount / 5);
//   var intervalID = setInterval(function () {
//     totalTime -= 1;
//     var minutes = Math.floor(totalTime / 60);
//     var seconds = totalTime % 60;
//     if (minutes < 10) {
//       minutes = "0" + minutes;
//     }
//     if (seconds < 10) {
//       seconds = "0" + seconds;
//     }
//     document.getElementById(
//       "estimated-time"
//     ).innerHTML = `${minutes}:${seconds}`;
//     if (totalTime <= 0) {
//       clearInterval(intervalID);
//       document.getElementById("estimated-time").innerHTML = `00:00`;
//     }
//   }, 1000);
// }

async function cancel_detection() {
  alert(13);
  postIsCancelled(true);
}

// async function postIsCancelled(bool) {
//   fetch("http://127.0.0.1:1234/cancel_detection", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       isCancelled: bool,
//     }),
//   })
//     .then(async (response) => {
//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }
//       return response.json()
//     })
//     .then(async data => {
//       console.log(data);
//       if(data.isTrue) {
//         let modal = document.getElementById("modal");
//         modal.style.display = 'none'
//       }
//     })
//     .catch((error) => {
//       console.error("Error cancelling detection:", error);
//     });
// }

async function postIsCancelled(bool) {
  try {
    const response = await fetch("http://127.0.0.1:1234/cancel_detection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isCancelled: bool,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log(data);

    if (data.isTrue) {
      let modal = document.getElementById("modal");
      modal.style.display = "none";
    }
  } catch (error) {
    console.error("Error cancelling detection:", error);
  }
}

function postClassNames() {
  inputs = document.querySelectorAll(".form-detection-type input");
  var classNames = [];
  inputs.forEach((element) => {
    if (element.checked) {
      classNames.push(element.value);
    }
  });

  console.log(classNames);
  fetch("http://127.0.0.1:1234/class_names", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      classNames: classNames,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      console.log("Detection cancelled successfully");
    })
    .catch((error) => {
      console.error("Error cancelling detection:", error);
    });
}

function select_all_type(button) {
  var bool = false;
  if (button.innerHTML == "Chọn tất cả") {
    bool = true;
    button.innerHTML = "Xóa tất cả";
    button.classList.remove("btn-success");
    button.classList.add("btn-danger");
  } else {
    button.innerHTML = "Chọn tất cả";
    button.classList.remove("btn-danger");
    button.classList.add("btn-success");
  }
  inputs = document.querySelectorAll(".form-detection-type input");
  inputs.forEach((element) => {
    element.checked = bool;
  });
}

function renderUploadEvent() {
  const uploadForm = document.getElementById("uploadForm");

  uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(uploadForm);

    try {
      const response = await fetch("http://127.0.0.1:1234/uploadFile", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        document.querySelector("#video-wrapper").innerHTML = `
        <video class="w-100" id="streamingVideo" controls autoplay>
          <source src="" type="video/webm">
          Your browser does not support the video tag.
          </video>
        `;

        document.querySelector("#detect-option").innerHTML = `
        <button class="btn btn-info" data-toggle="collapse" data-target="#detectionTypeTable">Detect Video</button>
        <div id="detectionTypeTable" class="collapse show">
          <h4 style="margin: 10px;">Chọn ít nhất một object bạn muốn detect</h4>
          <div id="selectDetectionTypeForm">
            
          </div>
          <div class="btn-group">
            <button class="btn btn-success" type="button" onclick="select_all_type(this)">Chọn tất cả</button>
            <button id="detect_video" class="btn btn-primary" url="">Bắt đầu!</button>
          </div>
        </div>
        `;

        renderDetectOpt();
        addDetectBtn()
        
        const data = await response.json();
        streamingVideo();
        console.log(data.message);
      } else {
        console.error("Upload failed:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
}

// function renderDetectOption() {
//   document.querySelector("#detect-option").innerHTML = `
//   <button class="btn btn-info" data-toggle="collapse" data-target="#detectionTypeTable">Detect Video</button>
//   <div id="detectionTypeTable" class="collapse">
//     <h4 style="margin: 10px;">Chọn ít nhất một object bạn muốn detect</h4>
//     <div id="selectDetectionTypeForm">

//     </div>
//     <div class="btn-group">
//       <button class="btn btn-success" type="button" onclick="select_all_type(this)">Chọn tất cả</button>
//       <button id="detect_video" class="btn btn-primary" url="">Bắt đầu!</button>
//     </div>
//   </div>
//   `;

//   addEventDownload();
//   renderDetectOpt();
// }

function streamingVideo() {
  const videoElement = document.getElementById("streamingVideo");
  fetch("http://127.0.0.1:1234/stream_file")
    .then((response) => {
      const reader = response.body.getReader();
      const stream = new ReadableStream({
        start(controller) {
          function push() {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                push();
              })
              .catch((error) => {
                console.error("Error reading stream:", error);
                controller.error(error);
              });
          }
          push();
        },
      });
      return new Response(stream, {
        headers: { "Content-Type": "video/webm" },
      });
    })
    .then((response) => {
      return response.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      videoElement.src = url;
    })
    .catch((error) => {
      console.error("Error fetching stream:", error);
    });
}

classNamesDetect = [
  "Người",
  "Xe đạp",
  "Xe hơi",
  "Xe máy",
  "Máy bay",
  "Xe buýt",
  "Xe lửa",
  "Xe tải",
  "Thuyền",
  "Đèn giao thông",
  "Vòi chữa cháy",
  "Biển báo dừng",
  "Đồng hồ đỗ xe",
  "Băng ghế",
  "Con chim",
  "Con mèo",
  "Con chó",
  "Con ngựa",
  "Con cừu",
  "Con bò",
  "Con voi",
  "Con gấu",
  "Ngựa vằn",
  "Hươu cao cổ",
  "Balo",
  "Cây dù",
  "Túi xách",
  "Cà vạt",
  "Va li",
  "Dĩa nhựa",
  "Ván trượt tuyết 2",
  "Ván trượt tuyết",
  "Bóng thể thao",
  "Diều",
  "Gậy bóng chày",
  "Găng tay",
  "Ván trượt",
  "Ván lướt sóng",
  "Vợt tennis",
  "Cái chai",
  "Ly rượu",
  "tách",
  "Cái nĩa",
  "Dao",
  "Muỗng",
  "Cái bát",
  "Chuối",
  "Táo",
  "Sandwich",
  "Cam",
  "Bông cải xanh",
  "Cà rốt",
  "Hot dog",
  "Pizza",
  "Donut",
  "Bánh ngọt",
  "Cái ghế",
  "Sofa",
  "Cây trong chậu",
  "Cái giường",
  "Bàn ăn",
  "Nhà vệ sinh",
  "Màn hình TV",
  "Laptop",
  "Con chuột",
  "Remote",
  "Bàn phím",
  "Điện thoại",
  "Lò vi sóng",
  "Oven",
  "Máy nướng bánh",
  "Bồn rửa",
  "Tủ lạnh",
  "Cuốn sách",
  "Đồng hồ",
  "Lọ cắm hoa",
  "Kéo",
  "Gấu bông",
  "Máy sấy tóc",
  "Bàn chải",
];

function renderDetectOpt() {
  const optionDectectWrapper = document.querySelector(
    "#selectDetectionTypeForm"
  );

  html = classNamesDetect
    .map((item, index) => {
      return `<div class="form-check form-detection-type">
            <label class="form-check-label" for="check${item}">
                <input type="checkbox" class="form-check-input" id="check${item}" name="${item}" value="${item}">${item}
            </label>
        </div>`;
    })
    .join("");

  optionDectectWrapper.innerHTML = html;
}

// renderDetectOpt()
