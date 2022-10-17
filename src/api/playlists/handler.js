const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlists berhasil dihapus',
    };
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePostSongToPlayListPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const action = 'add';
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const psId = await this._service.addSongToPlaylist(
      playlistId,
      songId,
      credentialId,
      action
    );

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke Playlist',
      data: {
        psId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._service.getSongsFromPlaylist(
      credentialId,
      playlistId
    );

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongHandler(request) {
    this._validator.validateDeleteSongToPlayListPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const action = 'delete';
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSongsFromPlaylist(
      playlistId,
      songId,
      credentialId,
      action
    );

    return {
      status: 'success',
      message: 'Lagu pada playlist berhasil dihapus',
    };
  }

  async getPlaylistActivities(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this._service.getPlaylistActivities(
      playlistId,
      credentialId
    );

    return {
      status: 'success',
      data: activities,
    };
  }
}

module.exports = PlaylistsHandler;
