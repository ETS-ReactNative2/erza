const Constants = require('../constants');
const { handleErrorResponse, getKeyByValue, stringToBool } = require('../utils/common');
const Functions = require('./common.js');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // mongoose mpromise is deprecated...so use native.

const Anime = require('../models/anime.js').Anime;
const Manga = require('../models/manga.js').Manga;
const Episode = require('../models/episode.js').Episode;


const getQueryModelForType = t => t === Constants.type.anime ? Anime : Manga;


const getStatusCounts = (req, res) => {
  const { params: { type, isAdult } } = req;
  const model = getQueryModelForType(type);
  model.getGroupedCount({
    groupBy: "$status",
    sort: 1,
    match: { isAdult: stringToBool(isAdult) }
  }).then(function(arr) {
    res.jsonp(
      arr.map(({ _id, value }) => ({ key: getKeyByValue(Constants.status, _id), value }))
    );
  })
}

const getRatingCounts = (req, res) => {
  const { params: { type, isAdult } } = req;
  const model = getQueryModelForType(type);
  model.getGroupedCount({
    groupBy: "$rating",
    sort: -1,
    match: { isAdult: stringToBool(isAdult) }
  }).then(function(arr) {
    res.jsonp(
      arr.map(({ _id, value }) => ({ key: `${_id}`, value }))
    );
  })
}


const getHistoryCounts = (req, res) => {
  const { params: { type, isAdult, breakdown } } = req;
  const model = getQueryModelForType(type);
  const breakdownObj = Functions.fetchBreakdownObject(breakdown);
  model.getGroupedCount({
    groupBy: "$month",
    sort: -1,
    match: { isAdult: stringToBool(isAdult), status: Functions.fetchStatusGrouping(breakdown) },
    project: Object.assign({}, { month: { $substr: [Functions.getDatePropertyString(breakdown), 0, 7] } }, breakdownObj.project),
    postMatch: breakdownObj.match
  }).then(function(arr) {
    res.jsonp(
      currateHistoryBreakdown(breakdown, arr)
    );
  })
}


const currateHistoryBreakdown = (breakdown, arr) => {
  if (Functions.historyBreakdownIsMonths(breakdown)) return arr.map(({ _id, value }) => ({ key: `${_id}`, value }));

  return arr
    .filter(x => !Functions.aggregateIsSeasonStart(x))
    .reduce((p, c) => {
      const {_id, value} = c;
      const [year, month] = _id.split("-");
      const seasonText = `${year}-${Functions.getSeasonStartMonth(month)}`;
      const index = p.findIndex(x => x._id === seasonText);

      if (index === -1) return [...p, { _id: seasonText, value }];
      const season = p[index];
      return Object.assign([...p], { [index]: { _id: season._id, value: season.value + value } });
    }, arr.filter(Functions.aggregateIsSeasonStart))
    .map(({ _id, value }) => ({ key: `${_id}`, value }));
}


const emptyEpisodeStatistic = () => ({ _id: "", average: 0.0, highest: 0, lowest: 0, mode: 0 })
const getHistoryCountsPartition = (req, res) => {
  const { params: { type, isAdult, breakdown, partition } } = req;
  const model = getQueryModelForType(type);
  const breakdownObj = Functions.fetchBreakdownObject(breakdown);

  model.getGroupedCount({
    groupBy: "$_id",
    sort: 1,
    match: { isAdult: stringToBool(isAdult), status: Functions.fetchStatusGrouping(breakdown) },
    project: Object.assign({}, { month: { $substr: [Functions.getDatePropertyString(breakdown), 0, 7] } }, breakdownObj.project),
    postMatch: Object.assign({}, { $and: [{ month: { $in: Functions.listOfMonths(breakdown, partition) } }, breakdownObj.match] })
  })
  .then(function(arr) {
    const list = arr.map(({ _id }) => _id);
    return model.findIn(list);
  })
  .then(function(docs) {
    if (Functions.historyBreakdownIsMonths(breakdown)) return docs.map(({ _id, title, rating }) => ({ _id, title, rating, episodeStatistics: emptyEpisodeStatistic() }))

    return attachEpisodeStatistics({ isAdult }, docs)
  })
  .then(function(result) {
    res.jsonp(result)
  });
}

const getHistoryCountsByYears = (req, res) => {
  const { params: { type, isAdult, breakdown, partition } } = req;
  const model = getQueryModelForType(type);
  const breakdownObj = Functions.fetchBreakdownObject(breakdown);

  model.getGroupedCount({
    groupBy: "$month",
    sort: 1,
    match: { isAdult: stringToBool(isAdult), status: Functions.fetchStatusGrouping(breakdown) },
    project: Object.assign({}, { year: { $substr: [Functions.getDatePropertyString(breakdown), 0, 4] }, month: { $substr: [Functions.getDatePropertyString(breakdown), 5, 2] } }, breakdownObj.project),
    postMatch: Object.assign({}, { year: { $in: [partition] } }, breakdownObj.match),
    grouping: { average: { $avg: "$rating" }, highest: { $max: "$rating" }, lowest: { $min: "$rating" }, ratings: { $push: "$rating" } }
  })
  .then(function(arr) {
	  const data = fixSeasonalResults(breakdown, arr).map(item => {
		  const ratings = item.ratings.slice(0);
		  delete item.ratings;

		  return Object.assign({}, item, {
		    mode: Functions.getModeRating(ratings)
		  });
	  });

	  res.jsonp(data);
  });
}

const attachEpisodeStatistics = async ({ isAdult }, parents) => {
  const parentIds = parents.map(({ _id }) => _id);
  const arr = await Episode.getGroupedAggregation({
    groupBy: "$parent",
    sort: 1,
    match: { isAdult: stringToBool(isAdult), parent: { $in: parentIds } }
  })

  return parents.map(item => {
    const { _id, title, rating } = item;
    const parentId = _id.toString();
    const episodeStatistics = (arr.find(x => x._id.toString() === parentId) || {});
    const episodeRatings = (episodeStatistics.ratings || []).slice(0);
    delete episodeStatistics.ratings;

    return { _id, title, rating, episodeStatistics: { ...emptyEpisodeStatistic(), ...episodeStatistics, mode: Functions.getModeRating(episodeRatings) } }
  });
}

const isASeasonStartMonth = obj => ["01", "04", "07", "10"].some(y => y === obj._id)
const fixSeasonalResults = (breakdown, data) => {
  if (Functions.historyBreakdownIsMonths(breakdown)) return data;

  return data
    .filter(x => !isASeasonStartMonth(x))
    .reduce((p, c) => {
      const {_id, value, average, highest, lowest, ratings} = c;
      const seasonNumber = `${Functions.getSeasonStartMonth(_id)}`;
      const index = p.findIndex(x => x._id === seasonNumber);

      if (index === -1) return [...p, { _id: seasonNumber, value, average, highest, lowest, ratings }];
      const season = p[index];
      const orderedArray = [...season.ratings, ...ratings].sort();
      const length = orderedArray.length;

      return Object.assign([...p], {
        [index]: {
          _id: season._id,
          value: season.value + value,
          average: orderedArray.reduce((p, c) => (p + c)) / length,
          highest: orderedArray[length - 1],
          lowest: orderedArray[0],
          ratings: orderedArray
        }
      });
    }, data.filter(isASeasonStartMonth))
}

const getHistoryCountsByYearsPartition = (req, res) => {
  const { params: { type, isAdult, breakdown, partition } } = req;
  const model = getQueryModelForType(type);
  const breakdownObj = Functions.fetchBreakdownObject(breakdown);
  let counts = {}

  model.getGroupedCount({
    groupBy: "$month",
    sort: 1,
    match: { isAdult: stringToBool(isAdult), status: Functions.fetchStatusGrouping(breakdown) },
    project: Object.assign({}, { year: { $substr: [Functions.getDatePropertyString(breakdown), 0, 4] }, month: { $substr: [Functions.getDatePropertyString(breakdown), 5, 2] } }, breakdownObj.project),
    postMatch: Object.assign({}, { year: { $in: [partition] } }, breakdownObj.match),
    grouping: { average: { $avg: "$rating" }, highest: { $max: "$rating" }, lowest: { $min: "$rating" }, ratings: { $push: "$rating" }, series: { $push: "$_id" } }
  })
  .then(function(arr) {
    let ids = []

    counts = fixSeasonalResults(breakdown, arr).map(item => {
      const ratings = item.ratings.slice(0);
      ids = [...ids, ...item.series]
      delete item.ratings;
      delete item.series;

      return Object.assign({}, item, {
        mode: Functions.getModeRating(ratings)
      });
    });

    return model.findIn(ids);
  })
  .then(function(docs) {
    if (Functions.historyBreakdownIsMonths(breakdown)) return docs.map(({ _id, title, rating }) => {
      return Object.assign({}, { _id, title, rating, episodeStatistics: emptyEpisodeStatistic() })
    })

    return attachEpisodeStatistics({ isAdult }, docs);
  })
  .then(function(detail) {
    res.jsonp({
      counts,
      detail
    })
  })
}

module.exports = {
	getStatusCounts,
	getRatingCounts,
	getHistoryCounts,
	getHistoryCountsPartition,
	getHistoryCountsByYears,
  getHistoryCountsByYearsPartition
};
