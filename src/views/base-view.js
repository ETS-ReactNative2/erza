import React, {Component, PropTypes} from 'react'
import {browserHistory, Link} from 'react-router'
import { connect } from 'react-redux'
import RatingControl from '../components/rating-control/rating-control'
import LoadingSpinner from '../components/loading-spinner/loading-spinner'
import HistoryList from '../components/list-components/history-list/history-list'
import {getKeyByValue} from '../utils/common'
import {formatDateForDisplay} from '../utils/date'
import {getUniquePropertiesForItemType} from '../utils/data'
import {Paths} from '../constants/paths'
import {Strings, Enums, Icons} from '../constants/values'

const loadData = props => props.loadItemById(props.itemId);
const loadHistory = props => props.loadHistoryForSeries(props.itemId);

class BaseView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hasHistory: false
    }

    this.handleHistoryDelete = this.handleHistoryDelete.bind(this);
  }

  componentDidMount() {
    loadData(this.props);
  }

  fetchHistory() {
    loadHistory(this.props);
    this.setState({ hasHistory: true });
  }

  handleHistoryDelete(historyId) {
    this.props.deleteAction(historyId);
  }

  render() {
    const { type, item, isFetching } = this.props;
    const {current, total} = getUniquePropertiesForItemType(type);
    if (isFetching) return (<LoadingSpinner size="fullscreen" />);

    return (
      <section>
        <div className="flex-row reverse">
          <div className="flex-all padding-10">
            <header className="flex-row center-contents">
              <h2 className="no-margin">{ item.title }</h2>
              <div className="flex-spacer"></div>
              <div className="button-group">
                <button type="button"
                        onClick={browserHistory.goBack}
                        className="button ripple">
                  { Strings.back }
                </button>
                <Link to={`${Paths.base}${Paths.anime.edit}${item._id}`}
                      className="button ripple">
                  { Strings.edit }
                </Link>
              </div>
            </header>
            <div className="view-content">

              <div>{ `${item[current]} / ${item[total] || '??'}` }</div>
              {
                type === Strings.manga &&
                <div>{ `${item.volume} / ${item.series_volumes || '??'}` }</div>
              }
              <RatingControl name="rating"
                value={item.rating || 0}
                />
              <ul className="list column two">
                <li className="label">{Strings.start}</li>
                <li className="value">{formatDateForDisplay(item.start)}</li>

                <li className="label">{Strings.end}</li>
                <li className="value">{formatDateForDisplay(item.end) || Strings.unfinished}</li>

                <li className="label">{Strings.isAdult}</li>
                <li className="value" icon={item.isAdult ? Icons.tick : Icons.cross}></li>

                <li className="label">{Strings.isRepeat}</li>
                <li className="value" icon={item.isRepeat ? Icons.tick : Icons.cross}></li>

                <li className="label">{Strings.owned}</li>
                <li className="value" icon={item.owned ? Icons.tick : Icons.cross}></li>

                <li className="label">{Strings.status}</li>
                <li className="value">{getKeyByValue(Enums.status, item.status)}</li>
                {
                  item.status === Enums.status.completed &&
                  <div className="formatting-container">
                    <li className="label">{Strings.timesCompleted}</li>
                    <li className="value">{item.timesCompleted}</li>
                  </div>
                }
                {
                  type === Strings.anime && item.season && item.season.inSeason &&
                  <div className="formatting-container">
                    <li className="label">{Strings.season}</li>
                    <li className="value">{`${item.season.season} ${item.season.year}`}</li>
                  </div>
                }
              </ul>
              <div>
              {
                !this.state.hasHistory &&
                <button
                  type="button"
                  className="button primary ripple"
                  onClick={() => this.fetchHistory()}
                >
                  View history
                </button>
              }
              {
                this.state.hasHistory &&
                <div>
                {
                  !this.props.history.length &&
                  <p>No history found.</p>
                }
                {
                  !!this.props.history.length &&
                  <HistoryList
                    type={type}
                    items={this.props.history}
                    deleteAction={this.handleHistoryDelete}
                  />
                }
                </div>
              }
              </div>
            </div>
          </div>
          <div className="series-image-container full">
            <img src={item.image} alt={`Cover for ${item.title}`} />
            <h4>Series tags</h4>
            <ul className="list column one">
            {
              !item.tagList &&
              <li>
                <p>{Strings.noItemsAvailable}</p>
              </li>
            }
            {
              !!item.tagList &&
              item.tagList.map(item => (
                <li key={item._id}>
                  { item.name }
                </li>
              ))
            }
            </ul>
          </div>
        </div>
      </section>
    );
  }
}

BaseView.propTypes = {
  type: PropTypes.string.isRequired,
  itemId: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired,
  history: PropTypes.arrayOf(PropTypes.object),
  isFetching: PropTypes.bool.isRequired,
  loadItemById: PropTypes.func.isRequired,
  loadHistoryForSeries: PropTypes.func.isRequired,
  deleteAction: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  isFetching: state.isFetching
})

export default connect(
  mapStateToProps
)(BaseView)