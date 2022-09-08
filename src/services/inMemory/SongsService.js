const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

/* eslint-disable */
class SongsService {
  constructor() {
    this.songs = [];
  }

  addSong({ title, year, genre, performer, duration, albumId }) {
    const id = 'song-' + nanoid(16);
    const newSong = {
      id,
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    };

    this.songs.push(newSong);

    const isSuccess = this.songs.filter((song) => song.id === id).length > 0;

    if (!isSuccess) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return id;
  }
  /*=============================================================================*/
  getSongs() {
    return this.songs;
  }
  /*=============================================================================*/
  getSongById(id) {
    const song = this.songs.filter((song) => song.id === id)[0];

    if (!song) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return song;
  }
  /*=============================================================================*/
  editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const songIndex = this.songs.findIndex((index) => index.id === id);

    if (songIndex === -1) {
      throw new NotFoundError('Gagal memperbarui Lagu, Id tidak ditemukan');
    }

    this.songs[songIndex] = {
      ...this.songs[songIndex],
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    };
  }
  /*=============================================================================*/
  deleteSongById(id) {
    const songIndex = this.songs.findIndex((index) => index.id === id);
    if (songIndex === -1) {
      throw new NotFoundError('Lagu gagal dihapus, Id tidak ditemukan');
    }

    this.songs.splice(songIndex, 1);
  }
}

module.exports = SongsService;
