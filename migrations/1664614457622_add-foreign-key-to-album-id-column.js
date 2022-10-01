/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.sql(
    "INSERT INTO albums(id, name, years) VALUES('old_album', 'old_album', 'old_album')"
  );

  pgm.sql("UPDATE songs SET 'album_id' WHERE album_id IS NULL");
};

exports.down = (pgm) => {};
