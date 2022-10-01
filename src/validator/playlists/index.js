const InvariantError = require('../../exceptions/InvariantError');
const {
  PostPlaylistPayloadSchema,
  PostSongToPlayListPayloadSchema,
  DeleteSongAtPlayListPayloadSchema,
} = require('./schema');

const PlayListValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PostPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePostSongToPlayListPayload: (payload) => {
    const validationResult = PostSongToPlayListPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateDeleteSongToPlayListPayload: (payload) => {
    const validationResult =
      DeleteSongAtPlayListPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlayListValidator;
