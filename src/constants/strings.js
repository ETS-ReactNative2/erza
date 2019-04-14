import { Strings } from 'mko';

export default {
  ...Strings,
  // inputs
  checkbox: 'checkbox',
  selectbox: 'select-one',
  date: 'date',
  text: 'text',
  // directions
  ascending: 'ASC',
  descending: 'DESC',
  next: 'next',
  prev: 'prev',
  // page text
  loading: 'loading',
  success: 'success',
  error: 'error',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  back: 'Back',
  ok: 'ok',
  // theme
  light: 'Light',
  dark: 'Dark',
  themes: [{ name: 'Light', value: 'one' }, { name: 'Dark', value: 'two' }],
  localUserSettings: 'settingState',
  // labels
  start: 'start',
  end: 'end',
  episode: 'episode',
  chapter: 'chapter',
  isAdult: 'is adult',
  isRepeat: 'is repeat',
  owned: 'owned',
  status: 'status',
  season: 'season',
  timesCompleted: 'times revisited',
  // page text
  filters: {
    all: 'all',
    ongoing: 'ongoing',
    completed: 'completed',
    onhold: 'onhold',
    planned: 'planned'
  },
  anime: 'anime',
  manga: 'manga',
  history: 'history',
  deleteConfirmation: 'Are you sure you want to delete this entry?',
  unfinished: 'Unfinished',
  // mal update messages
  fetchingMalEntry: 'fetching mal entry',
  noLinkedMalEntry: 'no related mal entry',
  failedMalUpdate: 'Failed to update mal entry',
  updatedMalEntry: 'updated mal values',
  malEntryUpToDate: 'mal already up to date',
  imgur: 'imgur',
  // yoruichi filters
  timePeriod: {
    day: 'DAY',
    week: 'WEEK'
  }
};

export const SatellizerFlags = Object.freeze({
  activeTab: {
    history: 'History',
    rating: 'Ratings',
    repeat: 'Repeated',
    airing: 'Airing'
  },
  breakdownType: {
    month: 'MONTHS',
    season: 'SEASON'
  },
  seasonMonths: new Map([
    ['Winter', '01'],
    ['Spring', '04'],
    ['Summer', '07'],
    ['Fall', '10']
  ])
});
