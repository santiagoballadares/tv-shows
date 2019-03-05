import React, {Component} from 'react';
import TvShowFinder from './tvShowFinder';

import style from '../styles/app.scss';

class App extends Component {
  render () {
    return (
      <div className={style.app}>
        <div><h1>TV Shows</h1></div>
        <TvShowFinder />
      </div>
    );
  }
}

export default App;
