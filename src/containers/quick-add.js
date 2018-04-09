import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import QuickAdd from 'components/quick-add/quick-add';

import { Strings } from 'constants/values';
import { loadAnimeById } from 'actions/anime';
import { loadMangaById } from 'actions/manga';
import { mapStateToEntity } from 'utils/data';

const mapStateToProps = (state, ownProps) => ({
  originalItem: mapStateToEntity(
    state.entities[ownProps.type],
    ownProps.seriesId
  ),
  loadItemById: props => {
    switch (props.type) {
      case Strings.anime:
        return props.actions.loadAnimeById(
          props.seriesId,
          'getAnimeByIdForQuickAdd'
        );
      case Strings.manga:
        return props.actions.loadMangaById(
          props.seriesId,
          'getMangaByIdForQuickAdd'
        );
      default:
        return console.log(
          `%c Unrecognised series type: ${props.type}`,
          'color: red'
        );
    }
  }
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      loadAnimeById,
      loadMangaById
    },
    dispatch
  )
});

export default connect(mapStateToProps, mapDispatchToProps)(QuickAdd);