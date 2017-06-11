import {CHAPTER_LOAD} from '../constants/actions'
import ChapterQL from '../graphql/query/chapter'
import ChapterML from '../graphql/mutation/chapter'
import {loadHistoryForSeries, mutateHistoryItem, loadHistoryByDateRange} from './list-items'
import {Strings} from '../constants/values'

export const loadChapterData = (data) => ({
  type: CHAPTER_LOAD,
  data
})

export const createChapter = item => mutateHistoryItem(
  item,
  ChapterML.createChapter
)

export const loadChaptersByDateRange = (filters = {}, pageChange = null) => loadHistoryByDateRange({
    pageChange,
    filters,
    type: Strings.chapter
  },
  ChapterQL.getChaptersForDateRange
)

export const loadChapterForSeries = parent => loadHistoryForSeries(
  Strings.chapter,
  ChapterQL.getChaptersForParent(parent)
)
