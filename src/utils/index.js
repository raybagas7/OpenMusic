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
    id: album[0].id,
    name: album[0].name,
    year: album[0].year,
    coverUrl: album[0].cover,
    songs: songs.map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    })),
  };

  return combined;
};

const mapDBToModelPlaylistSongs = (playlist_data, playlist_songs) => {
  const result = {
    ...playlist_data[0],
    songs: playlist_songs.map((song) => ({
      id: song.song_id,
      title: song.title,
      performer: song.performer,
    })),
  };

  return result;
};

const mapDBToModelActivities = (id, activities) => {
  const result = {
    playlistId: id,
    activities: activities.map((activity) => ({
      username: activity.username,
      title: activity.title,
      action: activity.action,
      time: activity.time,
    })),
  };

  return result;
};

module.exports = {
  mapDBToModel,
  mapDBToModelCombine,
  mapDBToModelPlaylistSongs,
  mapDBToModelActivities,
};
