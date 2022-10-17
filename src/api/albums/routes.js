const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler,
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.putAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
  },
  // {
  //   method: 'POST',
  //   path: '/albums/{id}/likes',
  //   handler: handler.likesAlbumByIdHandler,
  //   options: {
  //     auth: 'openmusic_jwt',
  //   },
  // },
  // {
  //   method: 'GET',
  //   path: '/albums/{id}/likes',
  //   handler: handler.likesAlbumByIdHandler,
  // },
];

module.exports = routes;
