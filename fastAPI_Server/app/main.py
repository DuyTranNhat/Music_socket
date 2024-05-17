from fastapi import FastAPI, Request, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import StreamingResponse
# from typing import List
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import joinedload
import uvicorn
from sockets import sio_app
from models import User, Address, Preference, Role, Account, Song, PlayList, SongList, Room, RoomUser

from database import SessionLocal

from models import User, Account, Song
import models
from pydantic import BaseModel

app = FastAPI()

db = SessionLocal()

app.mount(
    "/static",
    StaticFiles(directory=Path(__file__).parent.parent.absolute() / "static"),
    name="static",
)


templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware, allow_origins=['*'],
    allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

@app.get("/hello")
async def hello():
    return { "message": "Hello" }

# login 
class AccountBase(BaseModel):
    accountId: str
    password: str
    

#------------------------ user--------------------------
@app.post("/login")
async def login(account: AccountBase):
    # Thực hiện xác thực của người dùng ở đây
    # Đây chỉ là một ví dụ đơn giản
    print("account: ",  account)
        # return {"message": "Login successful", "username": account}
    user = db.query(User).join(Account).filter(Account.accountId == account.accountId).filter(Account.password == account.password).first()
        
        
    if user is not None:
        return user
    else:
        return { "ErrorLogin": "Tên đăng nhập hoặc mật khẩu không chính xác!" }
    

# if __name__ =='__main__':
#     port = int(1234)
#     uvicorn.run(app, host="127.0.0.1", port=port)

#------------------------ songs--------------------------

@app.get("/songs")
def get_songs(skip = 0, limit = 100):
    songs = db.query(models.Song).offset(skip).limit(limit).all()
    return songs

#create playlist
    
import os
import shutil
from typing import Annotated

UPLOAD_DIRECTORY  = "../../Client/images"
UPLOAD_DECTION_VIDEO = "../static/videos"

if not os.path.exists(UPLOAD_DECTION_VIDEO):
    os.makedirs(UPLOAD_DECTION_VIDEO)

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

class PlayListCreate(BaseModel):
    name: str
    desc: str
    image: str #path


# from typing import Annotated
@app.post("/users/{user_id}/playlists/")
async def create_playlist(user_id: int,  name:str = Form(None),desc:str = Form(None),  image: UploadFile= File(None)):
    print("user_id: ", user_id)
    print("user: ", name)
    print("desc: ", desc)
    print("image: ", image.filename)
    file_location = os.path.join(UPLOAD_DIRECTORY, image.filename)
    with open(file_location, "wb") as file_object:
        shutil.copyfileobj(image.file, file_object)
    file_location = 'images/' + image.filename

    playlistcreate= PlayListCreate(name = name, desc=desc, image= file_location)
    

    # print("0---------------------------", playlistcreate.image)

    print(playlistcreate.__dict__)

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    # db_playlist = PlayList(**playlist.dict(), user_id=user_id)
    db_playlist = PlayList(**playlistcreate.dict(), user_id=user_id)
    db.add(db_playlist)
    db.commit()
    db.refresh(db_playlist)
 
    return { "message" : "Đã thêm playlist " + " thành công!" }

@app.get("/user/{user_id}/playlists")
async def get_user_playlists(user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    playlists = user.playLists
    return playlists

@app.get("/playlist/{playlist_id}/songs")
def get_songs_by_playlist(playlist_id: int):
    playlist = db.query(PlayList).filter(PlayList.id == playlist_id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return playlist.songs



@app.post("/playlist/{playlist_id}/song/{song_id}")
def add_song_to_playlist(playlist_id: int, song_id: int):
    playlist = db.query(PlayList).filter(PlayList.id == playlist_id).first()
    song = db.query(Song).filter(Song.id == song_id).first()

    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    # Kiểm tra xem bài hát đã tồn tại trong playlist chưa
    if song in playlist.songs:
        return {"ErrorNotAvailable": "Song already exists in playlist"}

    playlist.songs.append(song)
    db.commit()

    return {"message": "Song added to playlist successfully"}

def getRoleUserInRoom(roomId: int, userId: int):
    # Truy vấn trong cơ sở dữ liệu để lấy thông tin về RoomUser
    room_user = db.query(models.RoomUser).filter_by(room_id=roomId, user_Id=userId).first()
    
    if room_user:
        return room_user.roleUser
    else:
        return None
    
@app.post("/deleteSongsInPList/{idSongs}/{idPlaylist}")
def delte_song_in_playlist(idSongs: int, idPlaylist: int):
    song_list_entry = db.query(SongList).filter(
        SongList.song_id == idSongs,
        SongList.playList_id == idPlaylist
    ).first()

    if song_list_entry is None:
        raise HTTPException(status_code=404, detail="Song not found in playlist")

    db.delete(song_list_entry)
    db.commit()

    return {"detailSuccessfull": "Song successfully deleted from playlist"}

from sqlalchemy import or_

@app.post("/findSongs/{keyFinding}")
def get_songs_by_name_and_singer(keyFinding: str):
    songs = db.query(Song).filter(
        or_(
            Song.name.like(f"%{keyFinding}%"),
            Song.singer.like(f"%{keyFinding}%")
        )
    ).all()
    
    return songs if songs else []

@app.get("/room_user_role")
def get_rooms_with_users():
    # Lấy tất cả các phòng từ cơ sở dữ liệu
    rooms = db.query(models.Room).all()

    rooms_with_users = []

    for room in rooms:
        users = []
        for room_user in room.users:
            user = room_user  
            roleUserInRoom = getRoleUserInRoom(room.id, user.id)
            user_dict = {
                "user_id": user.id,
                "user_first_name": user.first_name,
                "user_last_name": user.last_name,
                "user_email": user.email,
                "roleRoom":  roleUserInRoom
            }
            users.append(user_dict)
        
        # Thêm thông tin về phòng và danh sách người dùng vào danh sách
        rooms_with_users.append({
            "room_id": room.id,
            "room_name": room.name,
            "users": users
        })

    return rooms_with_users

class RoomUserUpdate(BaseModel):
    roleUser: str



#--------------sockets----------------------
from sockets import sio_server

class RoomLive:
    def __init__(self, room_id):
        self.room_id = room_id
        self.participants = set()
        self.current_song_info = {}
        self.currentTimeAudio = 0
        self.isPlaying = False

    #cập nhật thông tin bài hát hiện tại
    def update_current_song_info(self, progress_percent, current_index):
        self.current_song_info = {
            'progressPercent': progress_percent,
            'currentIndex': current_index
        }
        
    def get_current_song_info(self):
        return self.current_song_info
    
    def update_current_time_audio(self, current_time):
        self.currentTimeAudio = current_time

    # Lấy currentTimeAudio
    def get_current_time_audio(self):
        return self.currentTimeAudio
    
    def update_is_playing(self, is_playing):
        self.isPlaying = is_playing

    def get_is_playing(self):
        return self.isPlaying
        

# RoomManager quản lý danh sách các phòng
class RoomManager:
    def __init__(self):
        self.rooms = {}
        self.total = 0

    def join_room(self, room_id, user_id):
        if room_id not in self.rooms:
            self.rooms[room_id] = RoomLive(room_id=room_id)
        self.rooms[room_id].participants.add(user_id)

    def leave_room(self, room_id, user_id):
        if room_id in self.rooms:
            if user_id in self.rooms[room_id].participants:
                self.rooms[room_id].participants.remove(user_id)
        else:
            print(f"Room {room_id} does not exist in the RoomManager.")

    def get_allUser_in_room(self, room_id):
        if room_id in self.rooms:
            print(self.rooms[room_id].participants)
            return list(self.rooms[room_id].participants)
        else:
            return []
        
    def get_total_member(self, room_id):
        if room_id in self.rooms:
            return len(list(self.rooms[room_id].participants)) 

        
    def update_current_song_info(self, room_id, progress_percent, current_index):
        if room_id in self.rooms:
            self.rooms[room_id].update_current_song_info(progress_percent, current_index)
                

    def get_current_song_info(self, room_id):
        if room_id in self.rooms:
            return self.rooms[room_id].get_current_song_info()
        else:
            return {}
        
    def update_current_time_audio(self, room_id, current_time):
        if room_id in self.rooms:
            self.rooms[room_id].update_current_time_audio(current_time)

    # Lấy currentTimeAudio của một phòng
    def get_current_time_audio(self, room_id):
        if room_id in self.rooms:
            return self.rooms[room_id].get_current_time_audio()
        else:
            return None
        
    def update_is_playing(self, room_id, is_playing):
        if room_id in self.rooms:
            self.rooms[room_id].update_is_playing(is_playing)

    def get_is_playing(self, room_id):
        if room_id in self.rooms:
            return self.rooms[room_id].get_is_playing()
        else:
            return None
            


@sio_server.on('reRender_room_hall')     
async def rerenderRoomHall(sid, data):
    await sio_server.emit('reRender_room_hall', data)

                
room_manager = RoomManager()

@sio_server.on('join_room')       
async def join_room(sid, data):
    room_id = data['room_id']
    print('room ID', room_id)
    user_id = sid
    session = await sio_server.get_session(sid)
    session['room_id'] = room_id
    userId = session['userID']
    # userData = {}
    # userData['userId'] = userId
    # userData['sid'] = sid


    room_manager.join_room(room_id, userId)
    await sio_server.enter_room(sid, room_id)


    # print(room_manager.rooms[3].participants)
        
    userIdList = room_manager.get_allUser_in_room(room_id)
    print('listIduser: ', userIdList)

    user_dicts = []
    for id in userIdList:
        userById = db.query(User).filter(User.id == id).first()
        print('user: ', id)
        print('room', room_id)
        roleId = getRoleUserInRoom(room_id, id)
        user_dict = {
            'id': userById.id,
            'first_name': userById.first_name,
            'last_name': userById.last_name,
            'email': userById.email,
            'roleRoom': roleId
            
            # Thêm các thuộc tính khác của User vào đây nếu cần
        }


        user_dicts.append(user_dict)

    roomById = db.query(Room).filter(Room.id == room_id).first()

    room_dict = {
        'roomId' : roomById.id,
        'name' : roomById.name,
    }

    userJoinRoom = db.query(User).filter(User.id == userId).first()
    data = {'room': room_dict, 'listUser' : user_dicts, 'nameUserJoin': userJoinRoom.first_name}
    await sio_server.emit('join_room', data, room= room_id)


    print(f"User {user_id} joined room {room_id}")

@sio_server.on('cancelDetect')
async def cancel_detection(sid, data):
    global isCancelled
    isCancelled =  data['isCancelled']
    print('----------------------------------------', isCancelled)
    await sio_server.emit('cancelDetect', data, room = sid)

@sio_server.on('left_room')
async def left_room(sid):
    session = await sio_server.get_session(sid)
    userId = session['userID']
    room_id = session['room_id'] 

    room_manager.leave_room(room_id, userId)
    await sio_server.leave_room(sid, room_id)

    userIdList = room_manager.get_allUser_in_room(room_id)
    print('listIduser: ', userIdList)

    user_dicts = []
    for id in userIdList:
        userById = db.query(User).filter(User.id == id).first()
        roleId = getRoleUserInRoom(room_id, id)
        user_dict = {
            'id': userById.id,
            'first_name': userById.first_name,
            'last_name': userById.last_name,
            'email': userById.email,
            'roleRoom': roleId
            # Thêm các thuộc tính khác của User vào đây nếu cần
        }

        user_dicts.append(user_dict)

    roomById = db.query(Room).filter(Room.id == room_id).first()

    print('listIduser: ', userIdList)

    room_dict = {
        'roomId': roomById.id,
        'name': roomById.name
    }

    userJoinRoom = db.query(User).filter(User.id == userId).first()

    data = {'room': room_dict, 'listUser' : user_dicts, 'nameUserJoin': userJoinRoom.first_name}
    
    await sio_server.emit('left_room', data, room= room_id)

@sio_server.on("kickUser")
async def kickUser(sid, data):
    session = await sio_server.get_session(sid)
    room_id = session['room_id'] 

    #---
    await sio_server.emit('kickUser', data, room= room_id)

@sio_server.on('updateRoleUser')
async def updateRoleUser(sid, data):
    user_id= data['user_id']
    roleUser= data['roleUser']
    idUpdate = data['user_id']
    session = await sio_server.get_session(sid)
    room_id = session['room_id'] 
    
    # Kiểm tra xem user_id và room_id có tồn tại không
    user = db.query(User).filter(User.id == user_id).first()
    room = db.query(Room).filter(Room.id == room_id).first()
    
    if not user or not room:
        raise HTTPException(status_code=404, detail="User or Room not found")
    
    roomUser = db.query(RoomUser).filter(RoomUser.room_id == room_id).filter(RoomUser.user_Id == user_id).first()


    if not roomUser:
        new_room_user_db = RoomUser(user_Id=user_id, room_id=room_id, roleUser=roleUser)
        db.add(new_room_user_db)
    else:
        roomUser.roleUser = roleUser
        db.add(roomUser)

    db.commit()
    
    db.close()

    data = { 'id' : idUpdate, 'roleUser': roleUser }

    #---
    await sio_server.emit('reRender_room', data, room= room_id)
    


#----music socket
@sio_server.on('playAudio')
async def playAudio(sid, user, infoSong, anotherSong):
    session = await sio_server.get_session(sid)
    roomId = session['room_id']

    print('000', infoSong)

    print("--here1")

    room_manager.update_is_playing(roomId, True)
    room_manager.update_current_song_info(roomId, infoSong['progressPercent'], infoSong['currentIndex'])
    if anotherSong is True:
        print('--here here')
        data = { 'user': user, 'currentSong_dict': infoSong }
        await sio_server.emit('chooseAnotherSong', data, room = roomId)
    else:
        data = { 'user': user, 'infoSong': infoSong }
        await sio_server.emit('playAudio', data, room = roomId)

@sio_server.on('pauseAudio')
async def pauseAudio(sid, user):
    session = await sio_server.get_session(sid)
    roomId = session['room_id']

    room_manager.update_is_playing(roomId, False)

    data = { 'user': user}

    await sio_server.emit('pauseAudio', data, room = roomId)


@sio_server.on('setCurrentTimeSong')
async def playAudio(sid, data):
    currentTimeAudio = data['currentTimeAudio']
    session = await sio_server.get_session(sid)
    roomId = session['room_id']

    print(currentTimeAudio)

    room_manager.update_current_time_audio(roomId, currentTimeAudio)

@sio_server.on('getCurrentTimeSong')
async def getCurrentSong(sid):
    session = await sio_server.get_session(sid)
    room_id = session['room_id']
     # Hàm này để lấy room_id từ sid, bạn cần tự thay thế hoặc cài đặt

    if room_id is not None:
        current_time_audio = room_manager.get_current_time_audio(room_id)
        print('------------------', current_time_audio)
        isPlaying = room_manager.get_is_playing(room_id)
        await sio_server.emit('getCurrentTimeSong', {'currentTimeAudio': current_time_audio, 'isPlaying': isPlaying }, room=sid)
    else:
        await sio_server.emit('error', {'message': 'Failed to get current song info'}, room=sid)


@sio_server.on('getCurrentSong')
async def playAudio(sid):
    session = await sio_server.get_session(sid)
    roomId = session['room_id']

    infoCurrentSong = room_manager.get_current_song_info(roomId)

    data = { 'currentSong_dict' : {}}
    
    if ('progressPercent' in infoCurrentSong and 'currentIndex' in infoCurrentSong):
        currentSong_dict = {
            'progressPercent': infoCurrentSong['progressPercent'],
            'currentIndex': infoCurrentSong['currentIndex']
        }
        
        data = { 'currentSong_dict' : currentSong_dict }
    
    await sio_server.emit('getCurrentSong', data, room= sid)


async def create_room_and_assign_host(user_id: int, room_name: int):
    # Check if the room already exists
    existing_room = db.query(models.Room).filter(models.Room.name == room_name).first()
    if existing_room:
        # If the room already exists, raise an HTTPException
        raise HTTPException(status_code=400, detail="Tên phòng đã tồn tại. Vui lòng đặt tên khác!")
    
    # Create a new room
    new_room = models.Room(name=room_name)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    
    # Assign the room to the user with the role of host
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_room_user = models.RoomUser(user_Id=user_id, room_id=new_room.id, roleUser="host")
    db.add(db_room_user)
    db.commit()
    db.refresh(db_room_user)
    
    return new_room


@sio_server.on('createNewRoom')
async def createNewRoom(sid, data):
    session = await sio_server.get_session(sid)
    user_id = session['userID']
    newNameRoom = data['new_room_name']

    await create_room_and_assign_host(user_id, newNameRoom)

    await sio_server.emit('renderCreateRoom', data = {})    



fileVideoName = ""


@app.post("/uploadFile")
async def upLoadVideo( video: UploadFile= File(None)):
    file_location = os.path.join(UPLOAD_DECTION_VIDEO, video.filename)
    with open(file_location, "wb") as file_object:
        shutil.copyfileobj(video.file, file_object)
        global fileVideoName
        fileVideoName = video.filename
    # file_location = 'images/' + video.filename
    return { "messagee": "Successfully!" }

import asyncio 

# Hoặc nếu bạn có một file cần streaming, bạn có thể làm như sau:
@app.get("/stream_file")
async def stream_file():
    file_path = "../static/videos/" + fileVideoName

    print(file_path)
    def file_iterator(file_path):
        with open(file_path, "rb") as file:
            while True:
                chunk = file.read(65536)  # Đọc 64 KB mỗi lần
                if not chunk:
                    break
                yield chunk

    return StreamingResponse(file_iterator(file_path), media_type="'video/webm'")


# @app.get("/stream_new_file")
# async def stream_file():
#     file_path = "../static/videos/" + fileVideoName 

#     print(file_path)
#     def file_iterator(file_path):
#         with open(file_path, "rb") as file:
#             while True:
#                 chunk = file.read(65536)  # Đọc 64 KB mỗi lần
#                 if not chunk:
#                     break
#                 yield chunk

#     return StreamingResponse(file_iterator(file_path), media_type="'video/webm'")

from PIL import Image, ImageDraw, ImageFont
from ultralytics import YOLO

ALLOWED_EXTENSIONS = ['mp4', 'avi']
videoDirectory = "videos/"
currentVideoFile = ""
currentVideoFrameCount = 0
classNames =["Người", "Xe đạp", "Xe hơi", "Xe máy", "Máy bay", "Xe buýt", "Xe lửa", "Xe tải", "Thuyền",
"Đèn giao thông", "Vòi chữa cháy", "Biển báo dừng", "Đồng hồ đỗ xe", "Băng ghế", "Con chim", "Con mèo",
"Con chó", "Con ngựa", "Con cừu", "Con bò", "Con voi", "Con gấu", "Ngựa vằn", "Hươu cao cổ", "Balo", "Cây dù",
"Túi xách", "Cà vạt", "Va li", "Dĩa nhựa", "Ván trượt tuyết 2", "Ván trượt tuyết", "Bóng thể thao", "Diều", "Gậy bóng chày",
"Găng tay", "Ván trượt", "Ván lướt sóng", "Vợt tennis", "Cái chai", "Ly rượu", "tách",
"Cái nĩa", "Dao", "Muỗng", "Cái bát", "Chuối", "Táo", "Sandwich", "Cam", "Bông cải xanh",
"Cà rốt", "Hot dog", "Pizza", "Donut", "Bánh ngọt", "Cái ghế", "Sofa", "Cây trong chậu", "Cái giường",
"Bàn ăn", "Nhà vệ sinh", "Màn hình TV", "Laptop", "Con chuột", "Remote", "Bàn phím", "Điện thoại",
"Lò vi sóng", "Oven", "Máy nướng bánh", "Bồn rửa", "Tủ lạnh", "Cuốn sách", "Đồng hồ", "Lọ cắm hoa", "Kéo",
"Gấu bông", "Máy sấy tóc", "Bàn chải"
]
classNames_detect = []  # Initialize empty or provide default
fontpath = "Roboto-Bold.ttf"
isCancelled=False
model = YOLO('yolov8n.pt')
import cv2

from fastapi.responses import RedirectResponse

outputPath = ''
firstFileName = ''

@app.get("/detectVideo")
async def detect_video():
    global fileVideoName
    global firstFileName
    firstFileName = fileVideoName
    inputPath = UPLOAD_DECTION_VIDEO + "/" + fileVideoName
    global outputPath
    outputPath = UPLOAD_DECTION_VIDEO + "/" + fileVideoName.split(".")[0] + '_detected.' + fileVideoName.split(".")[1]
    fileVideoName = fileVideoName.split(".")[0] + '_detected.' + fileVideoName.split(".")[1]

    print("outputPath", outputPath)
    print("fileVideoName", fileVideoName)

    video = cv2.VideoCapture(inputPath)
    frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    global currentVideoFrameCount
    currentVideoFrameCount = frame_count
    fps = int(video.get(cv2.CAP_PROP_FPS))
    width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*'avc1')
    await create_detect_video(video, outputPath, fourcc, fps, width, height) 
    data = { 'isCompleteDetected' : True,  "message": "Detect Successfully" }
    
    return data
    print("------------------------------outputPath-------------------------", fileVideoName)
    # return RedirectResponse(url='/new-route')
    # return {"Message": "Streaming successfully!"}

import math
import numpy as np

class ClassNames(BaseModel):
    classNames: list[str]

@app.post("/class_names")
async def receive_class_names(class_names: ClassNames):
    global classNames_detect
    classNames_detect = class_names.classNames
    # print(received_class_names)
    return {"message": "Data received successfully"}
    

class CancelDetection(BaseModel):
    isCancelled: bool


from fastapi import  Response

@app.get("/download")
async def download_video():
    try:
        video_filename = firstFileName.split(".")[0] + '_detected.' + fileVideoName.split(".")[1]
        video_path = os.path.join(UPLOAD_DECTION_VIDEO, video_filename)

        if os.path.exists(video_path):
            with open(video_path, "rb") as video_file:
                video_data = video_file.read()
            headers = {
                "Content-Disposition": f"attachment; filename={video_filename}"
            }
            return Response(content=video_data, media_type="video/mp4", headers=headers)
        else:
            return {"error": "File not found"}
    except Exception as e:
        return {"error": str(e)}


@app.post("/cancel_detection")
async def cancel_detection(cancelDetection: CancelDetection):
    global isCancelled
    isCancelled = cancelDetection.isCancelled
    print('----------------------------------------', isCancelled)
    return {"message": "Variable 'isTrue' updated successfully", "isTrue": isCancelled}

import time

@app.get("/get_frame_count")
async def get_frame_count():
    time.sleep(1)
    print(currentVideoFrameCount)
    return {"frame_count": currentVideoFrameCount}

class RoomDeleteRequest(BaseModel):
    room_id: int


@app.post("/delete-room")
def delete_room(request: RoomDeleteRequest):
    room_users = db.query(RoomUser).filter(RoomUser.room_id == request.room_id).all()

    if (room_users):
        for room_user in room_users:
            db.delete(room_user)

    # Tìm Room theo ID
    room = db.query(Room).filter(Room.id == request.room_id).first()
    
    # Xóa Room
    db.delete(room)
    db.commit()
    return {"message": "Room deleted successfully"}

async def create_detect_video(video, outputPath, fourcc, fps, width, height):
    out = cv2.VideoWriter(outputPath, fourcc, fps, (width, height))
    global isCancelled
    while True: 
        success, img = video.read()
        results = model(img, stream=True)
        if not success:
            break
        if isCancelled:
            out.release()
            if os.path.exists(outputPath):
                os.remove(outputPath)
            break
        for r in results:
            boxes = r.boxes
            for box in boxes:
                x1,y1,x2,y2 = box.xyxy[0]
                x1,y1,x2,y2 = int(x1),int(y1),int(x2),int(y2)
                cls = int(box.cls[0])
                class_name = classNames[cls]
                if class_name in classNames_detect:
                    cv2.rectangle(img, (x1,y1), (x2,y2), (255,0,255), 3)
                    conf = math.ceil((box.conf[0]*100))/100
                    label = f'{class_name}{conf}'
                    t_size = cv2.getTextSize(label, 0, fontScale=1, thickness=2)[0]
                    c2 = x1 + t_size[0], y1 - t_size[1] - 3
                    cv2.rectangle(img, (x1,y1),c2, [255,0,255], -1, cv2.LINE_AA)
                    pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
                    draw = ImageDraw.Draw(pil_img)
                    font_size = 30
                    font = ImageFont.truetype(fontpath, font_size)
                    draw.text((x1,y1-30), label, font=font, fill=(255, 255, 255))
                    img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        out.write(img)


app.mount('/', app=sio_app)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=1234)