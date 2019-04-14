import PropTypes from 'prop-types';
import React from 'react';

import { List } from 'mko';
import { ButtonisedNavLink } from 'components/Buttonised';
import { Paths } from 'constants/paths';

const RelatedSeriesList = ({ seriesType, title, items }) => (
  <div className="related-series-container">
    <h4>{`${items.length} ${title}`}</h4>
    <List columns={1}>
      {items.map((x) => (
        <li key={x._id}>
          <ButtonisedNavLink
            className="button-link"
            to={`${Paths.base}${Paths[seriesType].view}${x._id}`}
          >
            {x.title}
          </ButtonisedNavLink>
        </li>
      ))}
    </List>
  </div>
);

RelatedSeriesList.defaultProps = {
  items: []
};

RelatedSeriesList.propTypes = {
  seriesType: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string
    })
  ).isRequired
};

export default RelatedSeriesList;
