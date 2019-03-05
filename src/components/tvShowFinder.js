import React, {Component} from 'react';
import {Button, Dropdown, Icon, Input, Table} from 'semantic-ui-react';
import moment from 'moment';
import {toWordsOrdinal} from 'number-to-words';

import OmdbApi from '../services/api/omdbApi';

import style from '../styles/app.scss';

class TvShowFinder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: 'Silicon Valley',
      searchSeasonNumber: 1,
      searchResult: {},
      loading: false,
    };
  }

  componentDidMount() {
    this.search();
  }

  onChangeSearchInput(event) {
    this.setState({searchTerm: event.target.value});
  }

  onChangeSeasonDropdown(event, {value}) {
    this.setState({searchSeasonNumber: value});
  }

  getSeasonOptions() {
    const {searchResult: {totalSeasons = 1}} = this.state;
    const seasons = [];
    for (let counter=1; counter<=totalSeasons; counter++) {
      seasons.push({text: toWordsOrdinal(counter), value: counter});
    }
    return seasons;
  }

  deleteItem(id) {
    const {searchResult: {Episodes = []}} = this.state;
    this.setState({
      searchResult: {
        ...this.state.searchResult,
        Episodes: Episodes.filter(episode => episode.imdbID !== id),
      }
    });
  }

  search() {
    const {searchTerm, searchSeasonNumber, loading} = this.state;
    if (searchTerm === '' || loading) {
      return;
    }
    this.setState({loading: true});
    OmdbApi.fetchSeason(searchTerm, searchSeasonNumber).then(res => {
      this.setState(
        {
          searchResult: res.data || {},
          loading: false,
        },
        () => {
          this.getPlots();
          console.log('Done searching.');
        }
      );
    })
    .catch(err => console.log('Error searching: ' + JSON.stringify(err)));
  }

  getPlots() {
    const {searchResult: {Episodes = []}} = this.state;
    for (let index = 0; index < Episodes.length; index++) {
      const currentEpisodeId = Episodes[index].imdbID;
      OmdbApi.fetchEpisode(currentEpisodeId).then(res => {
        const updatedEpisodes = Episodes.map((episode) => {
          if (episode.imdbID === currentEpisodeId) {
            episode.Plot = res.data.Plot || '';
          }
          return episode;
        });
        this.setState({
          searchResult: {
            ...this.state.searchResult,
            Episodes: updatedEpisodes,
          }
        });
      })
      .catch(err => console.log('Error searching: ' + JSON.stringify(err)));
    }
  }

  getSeasonAverageRating(episodes) {
    if (!episodes || !episodes.length) {
      return 0;
    }
    
    const averageRating = episodes.reduce((accumulator, episode) => {
      return accumulator + Number.parseFloat(episode.imdbRating);
    }, 0) / episodes.length;

    return Number.parseFloat(averageRating).toFixed(2);
  }

  getEpisodeReleasedMonth(releaseDate) {
    const dateMomentObject = moment(releaseDate);
    if (dateMomentObject.isValid()) {
      return dateMomentObject.format('MMMM');
    }
    return releaseDate;
  }

  renderSearchTools() {
    return (
      <div className={style.searchTools}>
        {this.renderSearchInput()}
        {this.renderSeasonDropdown()}
      </div>
    );
  }

  renderSearchInput() {
    const {searchTerm, loading} = this.state;
    return (
      <div className={style.searchInput}>
        <span>Search Term:&nbsp;</span>
        <Input
          action
          className={style.inputBox}
          placeholder='Search Shows...'
          value={searchTerm}
          onChange={this.onChangeSearchInput.bind(this)}
        >
          <input />
          <Button
            icon
            title='Search'
            loading={loading}
            onClick={this.search.bind(this)}
          >
            <Icon name='search' />
          </Button>
        </Input>
      </div>
    );
  }

  renderSeasonDropdown() {
    const {searchSeasonNumber, loading} = this.state;
    return (
      <div className={style.seasonDropdown}>
        <span>Season:&nbsp;</span>
        <Dropdown
          fluid
          selection
          placeholder='Select Season'
          loading={loading}
          disabled={loading}
          value={searchSeasonNumber}
          options={this.getSeasonOptions()}
          onChange={this.onChangeSeasonDropdown.bind(this)}
        />
      </div>
    );
  }

  renderShowDetails() {
    const {searchResult: {Title, Episodes = []}} = this.state;
    return (
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Show Name:</Table.Cell>
            <Table.Cell>{Title}</Table.Cell>
            <Table.Cell>Average Rating:</Table.Cell>
            <Table.Cell>{this.getSeasonAverageRating(Episodes)}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
  }

  renderEpisodesList() {
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Episode #</Table.HeaderCell>
            <Table.HeaderCell>Title</Table.HeaderCell>
            <Table.HeaderCell>Plot</Table.HeaderCell>
            <Table.HeaderCell>Poster</Table.HeaderCell>
            <Table.HeaderCell>Released</Table.HeaderCell>
            <Table.HeaderCell>IMDb Rating</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.renderEpisodes()}
        </Table.Body>
      </Table>
    );
  }

  renderEpisodes() {
    const {searchResult: {Episodes = []}} = this.state;
    if (!Episodes.length) {
      return (
        <Table.Row><Table.Cell colSpan='7' textAlign='center'>No results found</Table.Cell></Table.Row>
      );
    }
    return Episodes.map((episode, index) => {
      return (
        <Table.Row key={episode.imdbID} warning={episode.imdbRating >= 8.5}>
          <Table.Cell>{episode.Episode}</Table.Cell>
          <Table.Cell>{episode.Title}</Table.Cell>
          <Table.Cell>{episode.Plot}</Table.Cell>
          <Table.Cell>poster</Table.Cell>
          <Table.Cell>{this.getEpisodeReleasedMonth(episode.Released)}</Table.Cell>
          <Table.Cell>{episode.imdbRating}</Table.Cell>
          <Table.Cell>
            <Button
              icon
              title='Delete'
              onClick={this.deleteItem.bind(this, episode.imdbID, index)}
            >
              <Icon name='trash' />
            </Button>
          </Table.Cell>
        </Table.Row>
      );
    });
  }

  render() {
    return (
      <div className={style.appContainer}>
        {this.renderSearchTools()}
        {this.renderShowDetails()}
        {this.renderEpisodesList()}
      </div>
    );
  }
}

export default TvShowFinder;
