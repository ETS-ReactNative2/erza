import React from 'react';
import {Link} from 'react-router';
import {Paths} from '../../constants/paths';
import './home.css';

const Home = () => (
  <div>
    <ul className="site-map-list">
      <li>
        <div className="group-title">Anime</div>
        <div className="group-content">
          <p>
            <Link to={`${Paths.base}${Paths.anime.create}`}>
              Create an Anime
            </Link>
            <span>Enter details about a new anime entry.</span>
          </p>
          <p>
            <Link to={`${Paths.base}${Paths.anime.list}`}>
              Browse Anime
            </Link>
            <span>Search anime with a variable of filters and conditions</span>
          </p>
        </div>
      </li>
    </ul>
  </div>
)

export default Home;
