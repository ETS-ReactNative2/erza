import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import PagingControls from 'containers/PagingControls';
import QuickAdd from 'containers/QuickAdd';

import { selectPagingForType } from 'reducers/paging';
import { capitalise } from 'utils';
import { getUniquePropertiesForItemType, selectPageItems } from 'utils/data';

class BasePagedList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemIdForQuickAdd: null
    };

    this.openEditDialog = this.openEditDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
  }

  openEditDialog(_id) {
    this.setState({ itemIdForQuickAdd: _id });
  }

  closeDialog() {
    this.setState({ itemIdForQuickAdd: null });
  }

  handleEdit(values) {
    this.props.addHistoryToItem(values);
    this.setState({ itemIdForQuickAdd: null });
  }

  render() {
    const { isFetching, type, filters, list, items, paging } = this.props;
    const isQuickAddOpen = !!this.state.itemIdForQuickAdd;
    const PagedList = list;
    const { current } = getUniquePropertiesForItemType(type);

    const dynamicListProps = {
      [`add${capitalise(current)}`]: this.openEditDialog
    };

    const itemsForPage = selectPageItems(items, type, paging);

    return (
      <div className="flex flex--column flex--grow">
        <PagingControls listType={type} filters={filters} />
        <PagedList
          isFetching={isFetching}
          items={itemsForPage}
          {...dynamicListProps}
        />
        <QuickAdd
          isOpen={isQuickAddOpen}
          type={type}
          seriesId={this.state.itemIdForQuickAdd}
          onSubmit={this.handleEdit}
          onClose={this.closeDialog}
        />
      </div>
    );
  }
}

BasePagedList.propTypes = {
  type: PropTypes.string.isRequired,
  list: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  filters: PropTypes.object,
  paging: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  isFetching: state.isFetching,
  paging: selectPagingForType(state, ownProps)
});

export default connect(mapStateToProps)(BasePagedList);
