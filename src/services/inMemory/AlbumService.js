/* eslint-disable */
const { nanoid } = require('nanoid');
var _ = require('lodash');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumService {
  constructor() {
    this.albums = [];
  }

  addAlbum({ name, year }) {
    const id = 'album-' + nanoid(16);
    const newAlbum = {
      id,
      name,
      year,
    };

    this.albums.push(newAlbum);

    const isSuccess = this.albums.filter((album) => album.id === id).length > 0;

    if (!isSuccess) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return id;
  }
  /*=============================================================================*/
  getAlbumById(id) {
    const albumById = this.albums.filter((album) => album.id === id)[0];

    if (!albumById) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return albumById;
  }
  /*=============================================================================*/
  editAlbumById(id, { name, year }) {
    // const albumIndex = this.albums.findIndex((index) => index.id === id);
    const albumIndex = _.findIndex(this.albums, ['id', id]);

    if (albumIndex === -1) {
      throw new NotFoundError('Gagal memperbarui album, Id tidak ditemukan');
    }

    this.albums[albumIndex] = {
      ...this.albums[albumIndex],
      name,
      year,
    };
  }
  /*=============================================================================*/
  deleteAlbumById(id) {
    // const albumIndex = this.albums.findIndex((index) => index.id === id);
    const albumIndex = _.findIndex(this.albums, ['id', id]);

    if (albumIndex === -1) {
      throw new NotFoundError('Album gagal dihapus, Id tidak ditemukan');
    }

    this.albums.splice(albumIndex, 1);
  }
}

module.exports = AlbumService;
