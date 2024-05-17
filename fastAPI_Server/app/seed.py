from database import SessionLocal, engine
from models import User, Address, Preference, Role, Account, Song, PlayList, Room

role_data = [
    {"name": "Administrator", "slug": "admin"},
    {"name": "User", "slug": "user"},
]

user_data = [
    {
        "first_name": "John",
        "last_name": "Doe",
        "email": "johndoe@gmail.com",
        "addresses": [  
            {
                "road_name": "123 Main St",
                "postcode": "12345",
                "city": "London",
            },
            {
                "road_name": "456 Maple Ave",
                "postcode": "67890",
                "city": "Cambridge",
            }
        ],

        "playLists": [
            {
                "name": "My Love",
                "desc": "My Love containers song encouraging my emotion",
                "image": "images/04.jpg",
            },
            {
                "name": "East river dale",
                "desc": "My Love containers song encouraging my emotion",
                "image": "images/05.jpg"
            },
            {
                "name": "Bye bye baby",
                "desc": "My Love containers song encouraging my emotion",
                "image": "images/06.jpg"
            },
            {
                "name": "Chicken run",
                "desc": "My Love containers song encouraging my emotion",
                "image": "images/07.jpg"
            },
            {
                "name": "End of the road",
                "desc": "My Love containers song encouraging my emotion",
                "image": "images/08.jpg"
            },
            {
                "name": "Jail aint good",
                "desc": "My Love containers song encouraging my emotion",
                "image": "images/09.jpg"
            },
            {
                "name": "Jail aint good",
                "desc": "My Love containers song encouraging my emotion",
                "image": "images/10.jpg"
            },
        ],

        "rooms": [
            {
                "name": "Nghe nhạc cùng tôi",
            },
            {
                "name": "Nhạc Ballad",
            },
        ],

        "account": {
            "accountId": "duytn1006",
            "password": "Asdfgh1052003."
        },

        "preference": {
            "currency": "USD",
            "language": "English"
        }
    },
    {
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "janesmith@gmail.com",

        "rooms": [
            {
                "name": "Giải trí ban đêm",
            },
            {
                "name": "Bốc Cháy Mùa Hè",
            },
        ],

          "playLists": [
            {
                "name": "My Love",
                "desc": "My Love containers song encouraging my emotion",
                "image": "images/04.jpg",
            },
            {
                "name": "East river dale",
                "desc": "My Love containers song encouraging my emotion",
                "image": "images/05.jpg"
            },
            {
                "name": "Bye bye baby",
                "desc": "My Love containers song encouraging my emotion",
                "image": "images/06.jpg"
            },
            {
                "name": "Chicken run",
                "desc": "My Love containers song encouraging my emotion",
                "image": "images/07.jpg"
            },
            {
                "name": "End of the road",
                "desc": "My Love containers song encouraging my emotion",
                "image": "images/08.jpg"
            },
            {
                "name": "Jail aint good",
                "desc": "My Love containers song encouraging my emotion",
                "image": "images/09.jpg"
            },
            {
                "name": "Jail aint good",
                "desc": "My Love containers song encouraging my emotion",
                "image": "images/10.jpg"
            },
        ],

        
        "addresses": [
            {
                "road_name": "789 Oak St",
                "postcode": "54321",
                "city": "Paris",
            },
            {
                "road_name": "321 Elm St",
                "postcode": "09876",
                "city": "Lyon",
            }
        ],

        "account": {
            "accountId": "duytn1005",
            "password": "Asdfgh1052003."
        },

        "preference": {
            "currency": "EUR",
            "language": "German"
        }
    },
    {
        "first_name": "Bob",
        "last_name": "Johnson",
        "email": "bobjohnson@gmail.com",
        "addresses": [
            {
                "road_name": "555 Cedar St",
                "postcode": "11111",
                "city": "Berlin",
            },
            {
                "road_name": "777 Pine St",
                "postcode": "22222",
                "city": "Frankfurt",
            }
        ],

        "account": {
            "accountId": "duytn1009",
            "password": "Asdfgh1052003."
        },

        "preference": {
            "currency": "JPY",
            "language": "Japanese"
        }
    },
    {
        "first_name": "Alice",
        "last_name": "Lee",
        "email": "alicelee@example.com",
        "addresses": [
            {
                "road_name": "999 Birch Rd",
                "postcode": "33333",
                "city": "San Diego",
            },
            {
                "road_name": "222 Maple Rd",
                "postcode": "44444",
                "city": "Sacramento",
            }
        ],

        "account": {
            "accountId": "duytn1036",
            "password": "Asdfgh1052003."
        },

        "preference": {
            "currency": "GBP",
            "language": "English"
        }
    },
    {
        "first_name": "David",
        "last_name": "Kim",
        "email": "davidkim@example.com",
        "addresses": [
            {
                "road_name": "444 Cherry Ln",
                "postcode": "55555",
                "city": "Porto",
            },
            {
                "road_name": "888 Pine Ln",
                "postcode": "66666",
                "city": "Lisbon",
            }
        ],
        

        "account": {
            "accountId": "duytn2006",
            "password": "Asdfgh1052003."
        },
        
        "preference": {
            "currency": "AUD",
            "language": "English"
        }
    },
    {
        "first_name": "Emily",
        "last_name": "Nguyen",
        "email": "emilynguyen@example.com",
        "addresses": [
            {
                "road_name": "777 Oak Blvd",
                "postcode": "77777",
                "city": "Warsaw",
            },
            {
                "road_name": "333 Maple Blvd",
                "postcode": "88888",
                "city": "Kraków",
            }
        ],
        "account": {
            "accountId": "duytn1406",
            "password": "Asdfgh1052003."
        },

        "preference": {
            "currency": "USD",
            "language": "Vietnamese"
        }
    },
    {
        "first_name": "Michael",
        "last_name": "Davis",
        "email": "michaeldavis@example.com",
        "addresses": [
            {
                "road_name": "111 Elm Blvd",
                "postcode": "99999",
                "city": "Birmingham",
            },
            {
                "road_name": "444 Oak Blvd",
                "postcode": "00000",
                "city": "London",
            }
        ],
        "account": {
            "accountId": "duytn3006",
            "password": "Asdfgh1052003."
        },

        "preference": {
            "currency": "EUR",
            "language": "English"
        }
    }
]


songs_data = [
    {
      "name": "Bạn Cấp 3",
      "singer": "Trần Nhật Duy",
      "path": "https://a128-z3.zmdcdn.me/69b485fcd5c3079c5e67d5e6fe37a760?authen=exp=1713590846~acl=/69b485fcd5c3079c5e67d5e6fe37a760/*~hmac=5af60c67a2bea742e1e4d5c30997f16a",
      "image": "https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_jpeg/cover/b/e/d/9/bed9cb6138641f07813c57ff33ec4871.jpg"
    },
    {
      "name": "Sống Cho Hết Đời Thanh Xuân",
      "singer": "Tiến Đạt & Kiều Ngân",
      "path": "https://a128-z3.zmdcdn.me/cb63b0492794fc18aac80b2c37beecf4?authen=exp=1713591143~acl=/cb63b0492794fc18aac80b2c37beecf4/*~hmac=92ba8855dbcc761ee182ab699d5a6dc8",
      "image":
        "https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_jpeg/cover/6/f/b/d/6fbdf721cf0e0da4f09ed9d9fb06289e.jpg"
    },
    {
      "name": "Vùng Ký Ức",
      "singer": "Trần Nhật Duy",
      "path":
        "https://a128-z3.zmdcdn.me/76ddf1ab03f9f42f7011e52bcca3855a?authen=exp=1713591297~acl=/76ddf1ab03f9f42f7011e52bcca3855a/*~hmac=928999e63ee34dffc2d21b61f2947080",
      "image": "https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_jpeg/cover/8/2/1/9/821987485fbc872556d3fecb066f1de3.jpg"
    },
    {
      "name": "Sau Lời Khước Từ",
      "singer": "Phan Mạnh Quỳnh",
      "path": "https://a128-z3.zmdcdn.me/34b32a8033ec7f6707368a6296df62a3?authen=exp=1713755989~acl=/34b32a8033ec7f6707368a6296df62a3/*~hmac=fbbd3ff5f1b6660da42dce8862240f18",
      "image":
        "https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_jpeg/cover/e/d/0/7/ed0741228ad36870e13624120474e50a.jpg"
    },
    {
      "name": "Aage Chal",
      "singer": "Raftaar",
      "path": "https://mp3.vlcmusic.com/download.php?track_id=25791&format=320",
      "image":
        "https://a10.gaanacdn.com/images/albums/72/3019572/crop_480x480_3019572.jpg"
    },
    {
      "name": "Damn",
      "singer": "Raftaar x kr$na",
      "path":
        "https://mp3.filmisongs.com/go.php?id=Damn%20Song%20Raftaar%20Ft%20KrSNa.mp3",
      "image":
        "https://filmisongs.xyz/wp-content/uploads/2020/07/Damn-Song-Raftaar-KrNa.jpg"
    },
    {
      "name": "Feeling You",
      "singer": "Raftaar x Harjas",
      "path": "https://mp3.vlcmusic.com/download.php?track_id=27145&format=320",
      "image":
        "https://a10.gaanacdn.com/gn_img/albums/YoEWlabzXB/oEWlj5gYKz/size_xxl_1586752323.webp"
    }
]

from database import SessionLocal


from sqlalchemy import delete, select


import  models
from database import SessionLocal, engine

models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

def seedUsers():
    for role in role_data:
        db.add(Role(**role))

    db.commit()

    roles = db.query(Role).all()

    users = []

    for u in user_data:
        user = User()
        user.first_name = u.get("first_name")
        user.last_name = u.get("last_name")
        user.email = u.get("email")

        addresses = []
        for address in u.get("addresses"):
            addresses.append(Address(**address))

        playlists = []
        Playlist_datas = u.get("playLists")
        if Playlist_datas is not None:
            for playList in Playlist_datas:
                playlists.append(PlayList(**playList))
                
        rooms = []

        rooms_datas = u.get("rooms")
        if rooms_datas is not None:
            for room in rooms_datas:
                rooms.append(Room(**room))
        

        user.addresses.extend(addresses)
        user.preference = Preference(**u.get("preference"))
        user.account = Account(**u.get("account"))
        user.roles = roles
        user.playLists.extend(playlists)
        user.rooms.extend(rooms)

        users.append(user)

        db.add_all(users)
        db.commit()

seedUsers()

        # stmt = delete(Song).where(Song.id.in_(select(Song.id).limit(22)))
        # db.execute(stmt)
        # db.commit()

def seedsongs():
    songs = []

    for s in songs_data:
        song = Song()
        song.image = s.get("image")
        song.path = s.get("path")
        song.singer = s.get("singer")
        song.name = s.get("name")
        songs.append(song)

        
    db.add_all(songs)
    db.commit()

seedsongs()