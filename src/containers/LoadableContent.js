import { connect } from 'react-redux';

import { LoadableContent } from 'mko';

const mapStateToProps = (state) => ({
  isFetching: state.isFetching
});

export default connect(mapStateToProps)(LoadableContent);
