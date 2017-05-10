import React, {Component, PropTypes} from 'react'
import { connect } from 'react-redux'
import LoadingSpinner from '../../components/loading-spinner/loading-spinner'
import ListFilter from '../../containers/list-filter/list-filter'
import PagedAnimeList from '../../containers/paged-anime-list/paged-anime-list'
import {Strings, Enums} from '../../constants/values'
import {getEventValue, getTimeoutSeconds} from '../../utils/common'
import { loadAnime } from '../../actions/anime'

const loadData = (props, state) => {
  const status = Enums.anime.status[props.params.filter];
  let statusIn = !!status.length ? status : [status];
  statusIn = (props.params.filter === Strings.filters.ongoing) ? statusIn.concat([Enums.anime.status.onhold]) : statusIn;
  props.loadAnime({ statusIn, ...state });
}

class Anime extends Component {

  constructor() {
    super();
    this.state = {
      search: ''
    };

    this.handleUserInput = this.handleUserInput.bind(this);
  }

  componentDidMount() {
    loadData(this.props, this.state);
  }

  componentWillReceiveProps(nextProps) {
    console.log('%c will get props !! > ', 'font-size: 18px; font-weight: bold; color: indigo', nextProps, this.props);
    if (
      nextProps.isAdult !== this.props.isAdult ||
      nextProps.sortKey !== this.props.sortKey ||
      nextProps.sortOrder !== this.props.sortOrder ||
      nextProps.params.filter !== this.props.params.filter ||
      nextProps.location.key !== this.props.location.key
    ) {
      loadData(nextProps, this.state)
    }
  }

  handleUserInput({ target }) {
    const newValue = getEventValue(target);
    this.setState({ [target.name]: newValue });
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => loadData(this.props, this.state), getTimeoutSeconds(1));
  }

  render() {
    const { items } = this.props;
    // const searchString = this.state.search.toLowerCase();
    // const items = this.props.items.filter(x => x.title.toLowerCase().indexOf(searchString) > -1 && x.isAdult === this.props.isAdult);
    console.log('props => ', items);
    return (
      <div className="flex-row">
        <ListFilter
            search={this.state.search}
            onChange={this.handleUserInput}
        />
        {
          this.props.isFetching &&
          <LoadingSpinner size="fullscreen" />
        }
        {
          !this.props.isFetching &&
          <PagedAnimeList
              filters={{ ...this.state, status: Enums.anime.status[this.props.params.filter] }}
              items={items}
           />
        }
      </div>
    );
  }

}

Anime.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isAdult: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
  sortOrder: PropTypes.string.isRequired,
  sortKey: PropTypes.string.isRequired
}

// const getVisibleAnime = (anime, filter) => {
//   if (!anime || !anime.allIds.length) return Array(0);
//   const animeItems = anime.allIds.map(id => anime.byId[id]);
//   switch (filter) {
//     case Strings.filters.all:
//       return animeItems;
//     case Strings.filters.completed:
//       return animeItems.filter(x => x.status === Enums.anime.status.completed);
//     case Strings.filters.onhold:
//     case Strings.filters.ongoing:
//       return animeItems.filter(x => x.status === Enums.anime.status.ongoing || x.status === Enums.anime.status.onhold);
//     default:
//       throw new Error(`getVisibleAnime : Unknown filter type "${filter}"`)
//   }
// }

// const sortVisibleAnime = ({ sortOrder, sortKey }, items) => {
//   return items.sort((a, b) => {
//     if (a[sortKey] < b[sortKey]) return sortOrder === Strings.ascending ? -1 : 1;
//     if (a[sortKey] > b[sortKey]) return sortOrder === Strings.ascending ? 1 : -1;
//     return 0;
//   })
// }

const getAnimeList = state => state.allIds.map(id => state.byId[id]);

const mapStateToProps = (state, ownProps) => ({
  isFetching: state.isFetching,
  isAdult: state.isAdult,
  items: getAnimeList(state.entities.anime), //sortVisibleAnime(state.sorting, getVisibleAnime(state.entities.anime, ownProps.params.filter)),
  sortOrder: state.sorting.sortOrder,
  sortKey: state.sorting.sortKey
})

const mapDispatchToProps = {
  loadAnime
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Anime)
