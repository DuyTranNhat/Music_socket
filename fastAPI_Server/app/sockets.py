from socketio import AsyncServer, ASGIApp

sio_server = AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[]
)

sio_app = ASGIApp(
    socketio_server=sio_server,
    socketio_path='sockets'
)


@sio_server.event
async def connect(sid, environ, auth):
    print(f'{sid}: connected')
    await sio_server.emit('join', {'sid': sid})

@sio_server.event
async def setUserInfo(sid, data):
    session = await sio_server.get_session(sid)
    session['userID'] = data['user_id']

@sio_server.event
async def chat(sid, message):
    await sio_server.emit('chat', {'sid': sid, 'message': message})


@sio_server.event
async def disconnect(sid):
    print(f'{sid}: disconnected')


# -----------------------music



 
