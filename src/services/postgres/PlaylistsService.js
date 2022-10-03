const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelPlaylistSongs } = require('../../utils');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = 'playlist-' + nanoid(16);

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlists gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username 
      FROM playlists 
      INNER JOIN users 
      ON playlists.owner=users.id 
      WHERE playlists.owner = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal hapus playlists. Id tidak terdaftar');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses playlist ini');
    }
  }

  async verifySongId(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    await this.verifySongId(songId);

    const id = 'playlistsongs-' + nanoid(16);

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan pada playlists');
    }

    return result.rows[0].id;
  }

  async getSongsFromPlaylist(owner, playlistId) {
    const query_playlist = {
      text: `SELECT playlists.id, playlists.name, users.username 
      FROM playlists 
      INNER JOIN users 
      ON playlists.owner=users.id 
      WHERE playlists.owner = $1
      AND playlists.id = $2`,
      values: [owner, playlistId],
    };

    const result_playlist = await this._pool.query(query_playlist);

    const query = {
      text: `SELECT songs.id as song_id, songs.title, songs.performer
      FROM playlists
      INNER JOIN users
      ON playlists.owner = users.id
      JOIN playlist_songs
      ON playlists.id = playlist_songs.playlist_id
      JOIN songs
      ON playlist_songs.song_id = songs.id
      WHERE playlists.owner = $1
      AND playlists.id = $2`,
      values: [owner, playlistId],
    };

    const result = await this._pool.query(query);

    return mapDBToModelPlaylistSongs(result_playlist.rows, result.rows);
  }

  async deleteSongsFromPlaylist(playlistId, songId) {
    const query = {
      text: `DELETE FROM playlist_songs
      WHERE playlist_id = $1
      AND song_id = $2`,
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
