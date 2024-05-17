from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import Relationship

from database import Base

class UserRole(Base):
    __tablename__ = "user_roles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(80), nullable=False)
    slug = Column(String(80), nullable=False)

    users = Relationship("User", secondary="user_roles", back_populates="roles", passive_deletes=True)

    def __repr__(self):
        return f"{self.__class__.__name__}, name: {self.name}"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(80), nullable=False)
    last_name = Column(String(80), nullable=False)
    email = Column(String(320), nullable=False, unique=True)

    playLists = Relationship("PlayList", back_populates="user", passive_deletes=True)
    preference = Relationship("Preference", back_populates="user", uselist=False, passive_deletes=True)
    addresses = Relationship("Address", back_populates="user", passive_deletes=True)
    account =  Relationship("Account", back_populates="user", uselist=False, passive_deletes=True)
    roles = Relationship("Role", secondary="user_roles", back_populates="users", passive_deletes=True)
    rooms = Relationship("Room", secondary="room_user", back_populates="users", passive_deletes=True)
    
    
    
    def __repr__(self):
        return f"{self.__class__.__name__}, name: {self.first_name} {self.last_name}"
    
class RoomUser(Base):
    __tablename__ = "room_user"
    user_Id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), primary_key=True)
    #Quyền của user trong phòng đó (Host, Manager, Member)
    roleUser = Column(String(80)) 
    
class Room(Base):
    __tablename__ = "rooms" 
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(80), nullable=False)
    # user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    users = Relationship("User", secondary="room_user", back_populates="rooms", passive_deletes=True)



class Account(Base):
    __tablename__ = "accounts"

    accountId = Column(String(80), primary_key=True)
    password = Column(String(80), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    user = Relationship("User", back_populates="account")



class PlayList(Base):
    __tablename__ = "playlists"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(80), nullable=False)
    desc = Column(String(100), nullable= False)
    image = Column(String(200), nullable= False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    user = Relationship("User", back_populates="playLists")
    songs = Relationship("Song", secondary="song_list", back_populates="playlists", passive_deletes=True)

class SongList(Base):
    __tablename__ = "song_list"
    song_id = Column(Integer, ForeignKey("songs.id", ondelete="CASCADE"), primary_key=True)
    playList_id = Column(Integer, ForeignKey("playlists.id", ondelete="CASCADE"), primary_key=True)

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(80), nullable=False)
    singer = Column(String(100), nullable=False)
    path = Column(String(100), nullable=False)
    image = Column(String(100), nullable=False)
    
    playlists = Relationship("PlayList", secondary="song_list", back_populates="songs", passive_deletes=True)

    def __repr__(self):
        self



class Preference(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    language = Column(String(80), nullable=False)
    currency = Column(String(3), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, unique=True)

    user = Relationship("User", back_populates="preference")


class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    road_name = Column(String(80), nullable=False)
    postcode = Column(String(80), nullable=False)
    city = Column(String(80), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    user = Relationship("User", back_populates="addresses")

    def __repr__(self):
        return f"{self.__class__.__name__}, name: {self.city}"


   # users = []

    # for u in user_data:
    #     user = User()
    #     user.first_name = u.get("first_name")
    #     user.last_name = u.get("last_name")
    #     user.email = u.get("email")

    #     addresses = []
    #     for address in u.get("addresses"):
    #         addresses.append(Address(**address))

    #     user.addresses.extend(addresses)
    #     user.preference = Preference(**u.get("preference"))
    #     user.roles = roles

    #     users.append(user)