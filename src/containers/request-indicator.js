import { connect } from 'react-redux';

import { RequestIndicator } from 'meiko';

const mapStateToProps = state => ({
  hide: state.requestIndicator.isHidden,
  requestInFlight: !!state.requestIndicator.requests.length
});

export default connect(mapStateToProps)(RequestIndicator);
