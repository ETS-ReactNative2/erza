const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const { composeWithMongoose } = require('graphql-compose-mongoose');
const {MangaTC} = require('./manga.js');
const {
  historySharedSchema,
  dateRangeSearch
} = require('./history-shared.js');

const ChapterSchema = new Schema(
  Object.assign({}, historySharedSchema, {
    parent: {
      type: ObjectId,
      ref: 'Manga'
    },
    chapter: {
      type: Number,
      required: 'Chapter is a required field'
    }
  })
);

const Chapter = mongoose.model('Chapter', ChapterSchema);
const ChapterTC = composeWithMongoose(Chapter);

ChapterTC.addRelation(
  'series',
  () => ({
    resolver: MangaTC.getResolver('findById'),
    args: {
      _id: (source) => source.parent,
    },
    projection: { parent: 1 }
  })
)

const extendConnection = ChapterTC
  .getResolver('connection')
  .addFilterArg(dateRangeSearch(MangaTC));

extendConnection.name = 'connection';
ChapterTC.addResolver(extendConnection);

module.exports = {
  Chapter,
  ChapterTC
}
