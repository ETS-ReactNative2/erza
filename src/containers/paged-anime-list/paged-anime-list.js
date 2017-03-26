import React, { Component } from 'react'
import { connect } from 'react-redux'
import AnimeList from '../../components/anime-list/anime-list'
import {nextPage, prevPage, setItemsPerPage} from '../../actions/list-settings'

class PagedAnimeList extends Component {

  selectPageOfItems({ page, itemsPerPage }, items) {
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }

  render() {
    const {
      changeItemsPerPage,
      goForwardAPage,
      goBackAPage,
      items,
      paging
    } = this.props;
    const finalPage = Math.ceil(items.length / paging.itemsPerPage) - 1;
    const pagedItems = this.selectPageOfItems(paging, items);

    return (
      <div>
        <div>
          <div className="button-group">
            <button type="button"
                    className="button ripple"
                    onClick={goBackAPage}
                    disabled={paging.page === 0}
            >
            Previous
            </button>
            <button type="button"
                    className="button ripple"
                    onClick={goForwardAPage}
                    disabled={paging.page === finalPage}
            >
            Next
            </button>
          </div>
          <div className="has-float-label input-container">
            <select className="select-box"
                    name="itemsPerPage"
                    selected={paging.itemsPerPage}
                    onChange={(e) => changeItemsPerPage(e)}
            >
              {
                [5, 10, 15, 25].map(item => (
                  <option key={item}
                          value={item}
                  >
                  { item }
                  </option>
                ))
              }
            </select>
            <label>items per page</label>
          </div>
        </div>
        <AnimeList
            items={pagedItems}
        />
      </div>
    );
  }

}

const mapStateToProps = (state, ownProps) => ({
  paging: state.paging
})

const mapDispatchToProps = ({
  goBackAPage: prevPage,
  goForwardAPage: nextPage,
  changeItemsPerPage: setItemsPerPage
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PagedAnimeList)
