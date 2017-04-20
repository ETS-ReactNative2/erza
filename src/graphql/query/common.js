export const pagedDataWrapper = (fields) => (`
  edges {
    cursor
    node {
      ${fields}
    }
  }
  pageInfo {
    hasNextPage,
    hasPreviousPage,
    startCursor,
    endCursor
  }
  totalCount
`);

export const animeKeyFields = `
  id,
  title,
  episode,
  start,
  end,
  status,
  isAdult,
  owned,
  image,
  malId,
  series_episodes,
  updatedDate
`;

export const tagFields = `
  id,
  name,
  isAdult
`;