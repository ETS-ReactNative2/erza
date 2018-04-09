import { Strings } from 'constants/values';
import GenericListQueries from './list-items';

export const animeSpecificKeyFields = `
  episode
  series_episodes
`;

const getFilteredList = GenericListQueries.getFilteredList(
  Strings.anime,
  animeSpecificKeyFields
);
const getById = GenericListQueries.getById(
  Strings.anime,
  animeSpecificKeyFields
);
const getByIdForEdit = GenericListQueries.getByIdForEdit(
  Strings.anime,
  animeSpecificKeyFields
);
const getByIdForQuickAdd = GenericListQueries.getByIdForQuickAdd(
  Strings.anime,
  animeSpecificKeyFields
);

const AnimeQL = {
  getById,
  getFilteredList,
  getByIdForEdit,
  getByIdForQuickAdd
};

export default AnimeQL;
