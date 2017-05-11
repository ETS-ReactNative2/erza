import EpisodeModel from '../models/episode-model'

export const mapEpisodeData = (start = 0, { _id, episode, ratings, notes }) => {
  return Array(episode - start).fill(null).map((item, index) => {
    const episodeNumber = start + 1 + index;
    return new EpisodeModel({
      parent: _id,
      rating: ratings[episodeNumber] || 0,
      note: notes[episodeNumber] || '',
      episode: episodeNumber
    });
  });
};

export const mapStateToEntityList = state => state.allIds.map(id => state.byId[id]);
