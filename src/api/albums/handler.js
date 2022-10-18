const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this.service.addAlbum({
      name,
      year,
    });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this.service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this.validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    await this.service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this.service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }

  async addLikesAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.getAlbumById(albumId);
    const like = await this.service.likesAlbumById(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: like,
    });

    response.code(201);
    return response;
  }

  async getLikesAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;

    const { likes, isCache } = await this.service.getTotalLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes
      },
    });
    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }
}

module.exports = AlbumsHandler;
