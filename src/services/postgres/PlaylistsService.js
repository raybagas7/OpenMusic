const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const {
  mapDBToModelPlaylistSongs,
  mapDBToModelActivities,
} = require('../../utils');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
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
      LEFT JOIN collaborations
      ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id, users.username`,
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

  async addSongToPlaylist(playlistId, songId, userId, action) {
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
    await this.playlistSongActivities(playlistId, songId, userId, action);
    return result.rows[0].id;
  }

  async playlistSongActivities(playlistId, songId, userId, action) {
    const id = 'playlistActivities-' + nanoid(16);
    let time = new Date();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Activities gagal ditambahkan');
    }
  }

  async getSongsFromPlaylist(owner, playlistId) {
    const query_playlist = {
      text: `SELECT playlists.id, playlists.name, users.username 
      FROM playlists 
      INNER JOIN users 
      ON playlists.owner=users.id
      LEFT JOIN collaborations
      ON collaborations.playlist_id = playlists.id
      WHERE playlists.id = $2
      AND playlists.owner = $1
      OR collaborations.user_id = $1
      GROUP BY playlists.id, users.username`,
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
      LEFT JOIN collaborations
      ON collaborations.playlist_id = playlists.id
      WHERE playlists.id = $2
      AND playlists.owner = $1
      OR collaborations.user_id = $1`,
      values: [owner, playlistId],
    };

    const result = await this._pool.query(query);

    return mapDBToModelPlaylistSongs(result_playlist.rows, result.rows);
  }

  async deleteSongsFromPlaylist(playlistId, songId, userId, action) {
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

    await this.playlistSongActivities(playlistId, songId, userId, action);
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async getPlaylistActivities(playlistId, userId) {
    const query = {
      text: `SELECT playlist_song_activities.*, users.username, songs.title
      FROM playlist_song_activities
      LEFT JOIN playlists
      ON playlist_song_activities.playlist_id = playlists.id
      INNER JOIN users
      ON playlists.owner = users.id
      LEFT JOIN playlist_songs
      ON playlists.id = playlist_songs.playlist_id
      INNER JOIN songs
      ON playlist_song_activities.song_id = songs.id
      WHERE playlist_song_activities.playlist_id = $1
      AND user_id = $2
      ORDER BY time`,
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist activities tidak ditemukan');
    }

    return mapDBToModelActivities(playlistId, result.rows);
  }
}

module.exports = PlaylistsService;
