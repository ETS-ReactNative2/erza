import React, { PropTypes } from 'react'
import {Icons} from '../../constants/values'
import './input-search.css'

const DUMMY_EVENT = { target: { name: 'search', value: '' } };

const InputSearch = ({ search, onChange }) => (
  <div className="has-float-label input-container search">
    <input type="text"
      name="search"
      placeholder=" "
      value={search}
      onChange={onChange}
      autoComplete="false"
      />
    <label>search</label>
    {
      !!search &&
      <button
        type="button"
        className="button-icon small clear-search"
        icon={Icons.cross}
        onClick={() => onChange(DUMMY_EVENT)}
        ></button>
    }
  </div>
);

InputSearch.propTypes = {
  search: PropTypes.string,
  onChange: PropTypes.func.isRequired
}

export default InputSearch