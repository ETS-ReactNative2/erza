const Op = require('sequelize').Op;

const { db } = require('../connectors');
const Stats = require('./statistics');
const Paged = require('./paged');
const { Status } = require('../constants/enums');
const dateRange = require('../utils/dateRange');

const handleDeleteResponse = require('./utils/handleDeleteResponse');
const isOwnedOnlyArgs = require('./utils/isOwnedOnlyArgs');
const setHasMoreFlag = require('./utils/setHasMoreFlag');
const validateSortOrder = require('./utils/validateSortOrder');
const resolveWhereIn = require('./utils/resolveWhereIn');
const separateNewVsExistingTags = require('./utils/separateNewVsExistingTags');
const validateSeries = require('./validators/validateSeries');
const validateAndMapHistoryInput = require('./validators/validateAndMapHistoryInput');

// Query

async function checkIfSeriesAlreadyExists(model, { id, malId, title = '' }) {
  const orArgs = [{ title: { [Op.eq]: title } }];

  const series = await model.findOne({
    where: {
      id: { [Op.ne]: id },
      [Op.or]: malId ? [...orArgs, { malId: { [Op.eq]: malId } }] : orArgs
    }
  });

  return series !== null;
}

async function findAllRepeated(
  model,
  { search = '', minTimesCompleted = 1, isAdult }
) {
  return await model.findAll({
    where: {
      title: {
        [Op.like]: `%${search}%`
      },
      isAdult: { [Op.eq]: isAdult },
      status: { [Op.eq]: Status.Completed },
      [Op.or]: [
        { isRepeat: true },
        { timesCompleted: { [Op.gte]: minTimesCompleted } }
      ]
    },
    order: [['timesCompleted', 'DESC'], ['title', 'ASC']]
  });
}

// Mutation

async function createSeries(model, payload, mappers) {
  const { tags, ...values } = payload;
  const { newTags, existingTags } = separateNewVsExistingTags(tags);

  const series = validateSeries(values, mappers);
  const exists = checkIfSeriesAlreadyExists(model, series);

  if (exists) {
    return {
      success: false,
      errorMessages: [
        `Series "${series.title}" already exists. (Id: ${series.id}, Mal: ${
          series.malId
        })`
      ],
      data: null
    };
  }

  return db.transaction(async function(transaction) {
    const created = await model.create(
      { ...series, tags: newTags },
      { include: [model.Tag], transaction }
    );

    await created.addTags(existingTags, { transaction });

    return { success: true, errorMessages: [], data: created };
  });
}

async function updateSeries(model, payload, mappers) {
  const { tags, ...values } = payload;
  const { newTags, existingTags } = separateNewVsExistingTags(tags);

  const series = validateSeries(values, mappers);
  const exists = checkIfSeriesAlreadyExists(model, series);

  if (exists) {
    return {
      success: false,
      errorMessages: [
        `Series "${series.title}" already exists. (Id: ${series.id}, Mal: ${
          series.malId
        })`
      ],
      data: null
    };
  }

  return db.transaction(async function(transaction) {
    const { id, ...data } = series;
    const oldSeries = await model.findByPk(id, { include: [Tag], transaction });

    const removedExistingTags = oldSeries.tags.filter(
      (x) => !existingTags.some((t) => t.id === x.id)
    );
    const addedExistingTags = existingTags.filter(
      (x) => !oldSeries.tags.some((t) => t.id === x.id)
    );

    if (removedExistingTags.length) {
      await oldSeries.removeTags(removedExistingTags.map((x) => x.id), {
        transaction
      });
    }

    if (addedExistingTags.length) {
      await created.addTags(addedExistingTags.map((x) => x.id), {
        transaction
      });
    }

    await model.update(
      { ...data, tags: newTags },
      { where: { id }, include: [model.Tag], transaction }
    );

    const updated = await oldSeries.reload({ transaction });

    return { success: true, errorMessages: [], data: updated };
  });
}

async function updateSeriesWithHistory(
  { model, modelHistory },
  { series, history },
  { mapFromSeries, mapToSeries, mapHistory },
  validateMappers
) {
  const { id: seriesId, ...updates } = series;
  const values = mapToSeries(updates);

  return await db.transaction().then(async function(transaction) {
    const oldSeries = await model.findByPk(seriesId, { transaction });
    const stales = mapFromSeries(oldSeries.get({ raw: true }));

    if (stales.current > values.current) {
      transaction.rollback();
      return {
        success: false,
        errorMessages: [
          `The current part is greater than the updated part. (Current: ${
            stales.current
          }, Updated: ${values.current})`
        ],
        data: null
      };
    }

    const { id, ...processedSeries } = validateSeries(
      mapToSeries({ ...stales, ...values }),
      validateMappers
    );

    await model.update(processedSeries, {
      where: { id },
      transaction
    });

    const updated = await oldSeries.reload();
    const validate = validateAndMapHistoryInput(history, updated, {
      mapFromSeries,
      mapHistory
    });

    if (!validate.success) {
      transaction.rollback();
      return {
        success: false,
        errorMessages: [...validate.errorMessages],
        data: null
      };
    }

    if (validate.historyInputs.length) {
      await modelHistory.bulkCreate(historyInputs, { transaction });
    }

    transaction.commit();
    return { success: true, errorMessages: [], data: updated };
  });
}

async function updateEntity(model, args, id) {
  const updated = await model.update(args, { where: { id } });
  const data = await model.findByPk(id);
  return { success: true, errorMessages: [], data: data };
}

async function deleteEntity(model, where) {
  const deletedCount = await model.destroy({
    where
  });
  return handleDeleteResponse(where, deletedCount);
}

module.exports = {
  Stats,
  ...Paged,
  findAllRepeated,
  createSeries,
  updateSeries,
  updateSeriesWithHistory,
  updateEntity,
  deleteEntity
};
