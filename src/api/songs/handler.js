const autoBind = require('auto-bind');
class SongsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this.validator.validateSongPayload(request.payload);
    /* eslint-disable */
    const { title, year, genre, performer, duration, albumId } =
      request.payload;
    /* eslint-enable */
    const songId = await this.service.addSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });

    response.code(201);
    return response;
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;
    const songs = await this.service.getSongs({ title, performer });

    return {
      status: 'success',
      data: {
        songs: songs.map((song) => ({
          id: song.id,
          title: song.title,
          performer: song.performer,
        })),
      },
    };
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this.service.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request, h) {
    this.validator.validateSongPayload(request.payload);
    const { id } = request.params;
    await this.service.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    await this.service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
