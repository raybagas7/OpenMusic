const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongToPlayListPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const DeleteSongAtPlayListPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PostPlaylistPayloadSchema,
  PostSongToPlayListPayloadSchema,
  DeleteSongAtPlayListPayloadSchema,
};
