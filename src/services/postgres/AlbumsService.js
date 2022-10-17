const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelCombine } = require('../../utils');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const querySong = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    const resultSong = await this._pool.query(querySong);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return mapDBToModelCombine(result.rows, resultSong.rows);
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album, Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus, Id tidak ditemukan');
    }
  }

  async likesAlbumById(userId, albumId) {
    const query = {
      text: 'SELECT FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = this._pool.query(query);

    if (!result.rowsCount) {
      const addResult = await this.addLikeToAlbumById(userId, albumId);
      return addResult;
    }

    await this.deleteLikeToAlbumById(userId, albumId);
    return result;
  }

  async addLikeToAlbumById(userId, albumId) {
    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = this._pool.query(query);

    if (!result.rowsCount) {
      throw new InvariantError('Gagal menambahkan like ke album');
    }

    return result.rows[0].id;
  }

  async deleteLikeToAlbumById(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = this._pool.query(query);

    if (!result.rowsCount) {
      throw new InvariantError('Gagal menambahkan like ke album');
    }
  }
}

module.exports = AlbumsService;
