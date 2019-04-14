import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';

import ElmWrapper from 'components/ElmWrapper';
import ContentTypeFilters from './ContentTypeFilters';
import {
  debounce,
  getTimeoutSeconds,
  createListeners,
  capitalise
} from 'utils';
import getTheme from 'constants/elmThemes';
import * as SU from './statisticsUtils';

import Satellizer from 'satellizer';

const processScroll = (page) => () => {
  debounce(() => {
    const container = document.getElementById('history-breakdown-detail');
    const required = container && container.getBoundingClientRect().top < 55;
    page.ports.requireKey.send(!!required);
  }, getTimeoutSeconds(0.15));
};

class Statistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: getTheme(this.props.themeClass)
    };

    this.setupPorts = this.setupPorts.bind(this);
    this.scrollController = createListeners('scroll', processScroll(this))();
  }

  componentDidMount() {
    this.scrollController.listen();
  }

  componentWillUnmount() {
    this.scrollController.remove();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.contentType !== this.props.contentType ||
      prevProps.isAdult !== this.props.isAdult
    ) {
      this.ports.contentType.send(this.props.contentType);
      this.ports.isAdult.send(this.props.isAdult);
    }

    if (prevProps.themeClass !== this.props.themeClass) {
      this.ports.theme.send(getTheme(this.props.themeClass));
    }
  }

  setupPorts(ports) {
    this.ports = ports;
  }

  render() {
    const { isAdult, contentType, staticFlags } = this.props;
    const flags = {
      isAdult,
      contentType,
      ...staticFlags,
      ...this.state
    };

    return (
      <div className="flex flex--column padding-5">
        <Helmet>
          <title>{`${capitalise(contentType)} Statistics`}</title>
        </Helmet>
        <ContentTypeFilters />
        <div id="satellizer">
          <ElmWrapper
            src={Satellizer.Elm.Main}
            flags={flags}
            ports={this.setupPorts}
          />
        </div>
      </div>
    );
  }
}

Statistics.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isAdult: PropTypes.bool.isRequired,
  contentType: PropTypes.string.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  isFetching: state.isFetching,
  ...SU.getDynamicProps(state, ownProps),
  staticFlags: SU.getStaticFlags(ownProps),
  themeClass: state.theme ? state.theme.class : null
});

export default connect(mapStateToProps)(Statistics);