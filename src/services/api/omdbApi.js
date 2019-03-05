import axios from 'axios';

const apiKey = 'e9f2ca24';
const apiRoot = `https://www.omdbapi.com/?apikey=${apiKey}`;
const apiRootImages = `https://img.omdbapi.com/?apikey=${apiKey}`;

class omdbApi {
  static fetchSeason = (showName, seasonNumber = 1) => {
    const url = `${apiRoot}&t=${showName}&Season=${seasonNumber}`;
    return axios.get(url);
  };

  static fetchEpisode = (episodeId) => {
    const url = `${apiRoot}&i=${episodeId}&plot=short&r=json`;
    return axios.get(url);
  };

  static fetchEpisodePoster = (episodeId) => {
    const url = `${apiRootImages}&i=${episodeId}`;
    return axios.get(url);
  };
};

export default omdbApi;
