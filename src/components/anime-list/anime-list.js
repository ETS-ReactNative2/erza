import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {Paths} from '../../constants/paths'
import {Enums, Icons} from '../../constants/values'
import {formatDateForDisplay} from '../../utils/common'
import './anime-list.css'

const AnimeList = ({ items, addEpisode }) => (
  <ul className="anime-list">
    {
      items.length === 0 ? (
        <li>
          <p>No items to display.</p>
        </li>
      ) :
      items.map(item => (
        <li key={item._id} className="anime-item">
          <div>
            <time dateTime={item.updatedDate}>{ formatDateForDisplay(item.updatedDate) }</time>
            <h4>{ item.title }</h4>
            <div className="flex-row start-center-contents">
                {
                  !!addEpisode &&
                  <button
                    type="button"
                    className="button-icon small rounded primary"
                    icon="+"
                    onClick={() => addEpisode(item._id)}
                    disabled={item.status === Enums.anime.status.completed && !item.isRepeat}
                    ></button>
                }
              <span>{ `${item.episode}/${item.series_episodes || '??'}` }</span>
              {
                item.status === Enums.anime.status.onhold &&
                <span className="button-icon small bold"
                      icon={Icons.pause}></span>
              }
              {
                item.status === Enums.anime.status.completed &&
                <span className="button-icon small bold"
                      icon={Icons.tick}></span>
              }
              {
                item.isRepeat &&
                <span className="button-icon small bold"
                      icon={Icons.clockwise}></span>
              }
            </div>
            <div className="button-group">
              <Link to={`${Paths.base}${Paths.anime.view}${item._id}`}
                    className="button ripple">
                View
              </Link>
              <Link to={`${Paths.base}${Paths.anime.edit}${item._id}`}
                    className="button ripple">
                Edit
              </Link>
            </div>
          </div>
          <div className="flex-spacer"></div>
          <div className="series-image-container">
            <img src={item.image} alt={`Cover for ${item.title}`} />
          </div>
        </li>
      ))
    }
  </ul>
);

AnimeList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  addEpisode: PropTypes.func
}

export default AnimeList
