import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { nextPage, prevPage, setItemsPerPage } from '../../actions/paging';
import { pageSizes } from '../../constants/values';
import SelectBox from '../../components/select-box/select-box';

import './paging-controls.css';

const PagingControls = ({
  listType,
  filters,
  pageSizeOptions = pageSizes.default,
  paging,
  goBackAPage,
  goForwardAPage,
  changeItemsPerPage
}) => {
  const { pageInfo, itemsPerPage, page } = paging;
  const finalPage = Math.ceil(pageInfo.totalCount / itemsPerPage[listType]) - 1;
  const PAGE_SIZE_OPTIONS = pageSizeOptions.map(x => ({ value: x, text: x }));

  return (
    <div className="paging-controls flex-row">
      <div className="flex-grow">
        <div className="button-group centered flex-grow">
          <button
            type="button"
            className="button ripple"
            onClick={() => goBackAPage(listType, filters)}
            disabled={page === 0}
          >
            Previous
          </button>
          <div className="center-contents padding-5">
            {`${page + 1}/${finalPage + 1}`}
          </div>
          <button
            type="button"
            className="button ripple"
            onClick={() => goForwardAPage(listType, filters)}
            disabled={page === finalPage}
          >
            Next
          </button>
        </div>
        {!!pageInfo.totalCount && (
          <div className="item-count">{`Found ${
            pageInfo.totalCount
          } item(s)`}</div>
        )}
      </div>
      <SelectBox
        name="itemsPerPage"
        text="items per page"
        value={itemsPerPage[listType]}
        onSelect={e => changeItemsPerPage(e, listType)}
        options={PAGE_SIZE_OPTIONS}
      />
    </div>
  );
};

PagingControls.propTypes = {
  changeItemsPerPage: PropTypes.func.isRequired,
  goForwardAPage: PropTypes.func.isRequired,
  goBackAPage: PropTypes.func.isRequired,
  paging: PropTypes.object.isRequired,
  listType: PropTypes.string.isRequired,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number)
};

const mapStateToProps = (state, ownProps) => ({
  paging: state.paging
});

const mapDispatchToProps = {
  goBackAPage: prevPage,
  goForwardAPage: nextPage,
  changeItemsPerPage: setItemsPerPage
};

export default connect(mapStateToProps, mapDispatchToProps)(PagingControls);
