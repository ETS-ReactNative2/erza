export const Enums = {
  anime: {
    status: {
      ongoing: 1,
      completed: 2,
      onhold: 3,
      dropped: 4,
      planned: 6
    },
    type: {
      unknown: 0,
      tv: 1,
      ova: 2,
      movie: 3,
      special: 4,
      ona: 5,
      music: 6
    }
  },
  keyCode: {
    backspace: 8,
    enter: 13,
    up: 38,
    down: 40
  }
}

export const Strings = {
  // inputs
  checkbox: 'checkbox',
  selectbox: 'select-one',
  date: 'date',
  text: 'text',
  // properties
  episode: 'episode',
  isAdult: 'isAdult',
  isRepeat: 'isRepeat',
  // directions
  ascending: 'ASC',
  descending: 'DESC',
  // page text
  create: 'Create',
  edit: 'Edit',
  cancel: 'cancel',
  filters: {
    all: 'all',
    ongoing: 'ongoing',
    completed: 'completed'
  },
  anime: 'anime',
  manga: 'manga',
  monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
}
