import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Loadable from 'react-loadable';

import { Strings, Enums } from '../constants/values';
import { Paths } from '../constants/paths';
import {
  capitalise,
  getEventValue,
  isObject,
  objectsAreEqual
} from '../utils/common';
import { formatDateForInput } from '../utils/date';
import {
  mapStateToEntityList,
  shouldIntergrateMalEntry,
  intergrateMalEntry,
  getUniquePropertiesForItemType,
  itemModelForType
} from '../utils/data';
import animeValidator from '../utils/validators/anime-creation';
import mangaValidator from '../utils/validators/manga-creation';
import Loaders from '../components/loaders/index';
import RatingControl from '../components/rating-control/rating-control';
import Tickbox from '../components/tickbox/tickbox';
import SelectBox from '../components/select-box/select-box';
import ChipListInput from '../components/chip-list-input/chip-list-input';
import TabContainer from '../components/tab-container/tab-container';
import TabView from '../components/tab-view/tab-view';
import ClearableInput from '../components/clearable-input/clearable-input';
import { createTag, loadTags } from '../actions/tags';

const loadData = props => {
  props.loadTags();
  if (!!props.itemId) {
    props.actions.loadById(props.itemId, 'getByIdForEdit');
  }
};

const STATUS_OPTIONS = Object.keys(Enums.status)
  .filter(x => x !== 'all')
  .map(item => ({ text: capitalise(item), value: Enums.status[item] }));

const MalSearch = Loadable({
  loader: () =>
    import(/* webpackChunkName: 'mal-search' */ '../components/mal-search/mal-search'),
  loading: Loaders.Loadables.SimpleLoading,
  delay: 300
});
const ImageSelector = Loadable({
  loader: () =>
    import(/* webpackChunkName: 'image-selector' */ '../components/image-selector/image-selector'),
  loading: Loaders.Loadables.SimpleLoading,
  delay: 300
});

class BaseCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props.item,
      isAdult: props.isAdult
    }; // yes, i know i'm assigning a props to state.

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUserInput = this.handleUserInput.bind(this);
    this.handleMalSelect = this.handleMalSelect.bind(this);
    this.handleListUpdate = this.handleListUpdate.bind(this);
  }

  componentDidMount() {
    loadData(this.props);
    this.hydrateMalFields = intergrateMalEntry(this.props.type);
    this.shouldHydrateMal = shouldIntergrateMalEntry(this.props.type);
    this.validator =
      this.props.type === Strings.anime ? animeValidator : mangaValidator;
  }

  static getDerivedStateFromProps(nextProps) {
    if (
      !nextProps.item.tags ||
      !nextProps.item.tags.find(x => x && isObject(x))
    )
      return null;
    if (
      objectsAreEqual(nextProps.item, this.props.item) &&
      nextProps.isAdult === this.props.isAdult
    )
      return null;

    nextProps.loadTags();
    return { ...nextProps.item, isAdult: nextProps.isAdult };
  }

  handleMalSelect(malItem) {
    if (!this.shouldHydrateMal(this.state, malItem)) return;
    this.setState(prevState => this.hydrateMalFields(prevState, malItem));
  }

  handleUserInput({ target }) {
    const updatedValue = getEventValue(target);
    this.setState(prevState => {
      const updatedState = Object.assign({}, prevState, {
        [target.name]: updatedValue
      });
      return this.validator.validateChanges(updatedState, target.name);
    });
  }

  handleListUpdate(name, newList) {
    this.setState({ [name]: newList });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.validator.validateSubmission(this.state).then(item => {
      if (this.props.isCreate) return this.props.actions.create(item);
      return this.props.actions.edit(item);
    });
  }

  render() {
    if (this.props.isFetching)
      return <Loaders.LoadingSpinner size="fullscreen" />;
    const { type } = this.props;
    const { current, total } = getUniquePropertiesForItemType(type);
    const availableTags = this.props.typeaheadTags;

    return (
      <div className="flex-column center-contents padding-10">
        <header>
          <h4>
            {`${this.props.isCreate ? Strings.create : Strings.edit} ${
              Strings[type]
            }`}
          </h4>
        </header>
        <div className="width-100 flex-row">
          <div className="series-image-container full">
            {this.state.image &&
              this.state.image.startsWith('blob:') && (
                <div>
                  <p>* This is a preview image</p>
                </div>
              )}
            <img
              src={this.state.image}
              alt={`Cover for ${this.state.title || `${type} under creation.`}`}
            />
          </div>
          <form
            name={`${type}Form`}
            className="center-contents flex-column"
            autoComplete="false"
            noValidate=""
            onSubmit={this.handleSubmit}
          >
            <TabContainer>
              <TabView name="Required">
                <div className="flex-column width-100">
                  <MalSearch
                    id={this.state.malId}
                    itemId={this.state._id}
                    type={type}
                    search={this.state.title}
                    onUserInput={this.handleUserInput}
                    selectMalItem={this.handleMalSelect}
                  />

                  <ClearableInput
                    type="number"
                    name={current}
                    label={current}
                    value={this.state[current]}
                    min="0"
                    max={!!Number(this.state[total]) ? this.state[total] : null}
                    onChange={this.handleUserInput}
                  />

                  {type === Strings.manga && (
                    <ClearableInput
                      type="number"
                      name="volume"
                      label="volume"
                      value={this.state.volume}
                      min="0"
                      max={
                        !!Number(this.state.series_volumes)
                          ? this.state.series_volumes
                          : null
                      }
                      onChange={this.handleUserInput}
                    />
                  )}

                  <ClearableInput
                    type="date"
                    name="start"
                    label="start"
                    value={formatDateForInput(this.state.start)}
                    max={this.state.end}
                    onChange={this.handleUserInput}
                  />

                  <ClearableInput
                    type="date"
                    name="end"
                    label="end"
                    value={formatDateForInput(this.state.end)}
                    min={this.state.start}
                    onChange={this.handleUserInput}
                    disabled={this.state.status !== Enums.status.completed}
                  />

                  <SelectBox
                    name="status"
                    text="status"
                    value={this.state.status}
                    onSelect={this.handleUserInput}
                    options={STATUS_OPTIONS}
                  />

                  <RatingControl
                    name="rating"
                    label="series rating"
                    value={this.state.rating}
                    onChange={this.handleUserInput}
                  />

                  <ChipListInput
                    attr="name"
                    name="tags"
                    chipsSelected={this.state.tags}
                    chipOptions={availableTags}
                    updateChipList={this.handleListUpdate}
                    createNew={this.props.createTag}
                  />
                </div>
              </TabView>
              <TabView name="Additional">
                <div className="flex-column width-100">
                  <ClearableInput
                    type="number"
                    name={total}
                    label={`total ${current}s`}
                    value={this.state[total]}
                    min="0"
                    onChange={this.handleUserInput}
                  />

                  {type === Strings.manga && (
                    <ClearableInput
                      type="number"
                      name="series_volumes"
                      label="total volumes"
                      value={this.state.series_volumes}
                      min="0"
                      onChange={this.handleUserInput}
                    />
                  )}

                  <ImageSelector
                    name="image"
                    url={this.state.image}
                    onChange={this.handleUserInput}
                  />

                  <ClearableInput
                    type="url"
                    name="link"
                    label="link"
                    value={this.state.link}
                    placeholder=" "
                    onChange={this.handleUserInput}
                  />

                  <Tickbox
                    text="owned"
                    name="owned"
                    checked={this.state.owned}
                    onChange={this.handleUserInput}
                  />
                  <Tickbox
                    text="is adult"
                    name="isAdult"
                    checked={this.state.isAdult}
                    onChange={this.handleUserInput}
                  />
                  <Tickbox
                    text="is repeat"
                    name="isRepeat"
                    checked={this.state.isRepeat}
                    onChange={this.handleUserInput}
                    disabled={
                      this.state.status !== Enums.status.completed ||
                      (this.state.isRepeat && this.state[current] !== 0)
                    }
                  />
                </div>
              </TabView>
            </TabContainer>
            <div className="button-group">
              <button type="submit" className="button ripple">
                {this.props.isCreate ? Strings.create : Strings.edit}
              </button>
              <Link
                to={`${Paths.base}${Paths[type].list}${
                  Strings.filters.ongoing
                }`}
                className="button-link"
              >
                {Strings.cancel}
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

BaseCreate.propTypes = {
  type: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  isCreate: PropTypes.bool.isRequired,
  itemId: PropTypes.string,
  item: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  typeaheadTags: PropTypes.arrayOf(PropTypes.object),
  isAdult: PropTypes.bool.isRequired
};

const setEntityTags = (entities, item) =>
  entities.tags.allIds.length === 0
    ? item.tags
    : item.tags.map(_id => entities.tags.byId[_id]);
const getInitalItem = (entities, props) => {
  if (!props.itemId) return itemModelForType(props.type)();
  const item = entities[props.type].byId[props.itemId];

  if (!item) return itemModelForType(props.type)();
  const itemForEdit = Object.assign({}, item, {
    tags: !!item.tags ? setEntityTags(entities, item) : []
  });
  return itemModelForType(props.type)(itemForEdit);
};

const mapStateToProps = (state, ownProps) => ({
  isCreate: !ownProps.itemId,
  item: getInitalItem(state.entities, ownProps),
  isFetching: state.isFetching,
  typeaheadTags: mapStateToEntityList(state.entities.tags),
  isAdult: state.isAdult
});

const mapDispatchToProps = {
  createTag,
  loadTags
};

export default connect(mapStateToProps, mapDispatchToProps)(BaseCreate);
