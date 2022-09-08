/* eslint-disable*/
const mapDBToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

const mapDBToModelCombine = (album, songs) => {
  const combined = {
    ...album[0],
    songs: songs.map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    })),
  };

  return combined;
};

module.exports = { mapDBToModel, mapDBToModelCombine };
