import gql from 'graphql-tag';

// Fragments

const seriesFields = gql`
  fragment SeriesFields on Series {
    id
    title
    status
    isRepeat
    owned
    image
    link
    malId
    updatedAt
  }
`;

const seriesByIdFields = gql`
  ${seriesFields}
  fragment SeriesByIdFields on Series {
    ...SeriesFields
    start
    end
    rating
    isAdult
    timesCompleted
    tags {
      id
      name
    }
  }
`;

const seriesByIdEditFields = gql`
  ${seriesFields}
  fragment SeriesEditFields on Series {
    ...SeriesFields
    start
    end
    rating
    isAdult
    series_type
    series_start
    series_end
    timesCompleted
    tags {
      id
      name
    }
  }
`;

// TODO source the date of last repeat!!
const repeatedFields = gql`
  fragment RepeatedFields on Series {
    id
    title
    rating
    owned
    timesCompleted
  }
`;

const animeFields = gql`
  fragment AnimeFields on Anime {
    episode
    series_episodes
  }
`;

const mangaFields = gql`
  fragment MangaFields on Manga {
    chapter
    volume
    series_chapters
    series_volumes
  }
`;

// Queries

// By Id

export const getAnimeById = gql`
  query AnimeOne($id: Int!) {
    animeById(id: $id) {
      ...SeriesByIdFields
      ...AnimeFields
      season {
        inSeason
        season
        year
      }
    }
  }
  ${seriesByIdFields}
  ${animeFields}
`;

export const getAnimeByIdForEdit = gql`
  query AnimeOneEdit($id: Int!) {
    animeById(id: $id) {
      ...SeriesEditFields
      ...AnimeFields
    }
  }
  ${seriesByIdEditFields}
  ${animeFields}
`;

export const getMangaById = gql`
  query MangaOne($id: Int!) {
    mangaById(id: $id) {
      ...SeriesByIdFields
      ...MangaFields
    }
  }
  ${seriesByIdFields}
  ${mangaFields}
`;

export const getMangaByIdForEdit = gql`
  query MangaOneEdit($id: Int!) {
    mangaById(id: $id) {
      ...SeriesEditFields
      ...MangaFields
    }
  }
  ${seriesByIdEditFields}
  ${mangaFields}
`;

// Paged

export const getAnimePaged = gql`
  query AnimePage(
    $search: String
    $status: [Status]
    $isOwnedOnly: Boolean
    $isAdult: Boolean
    $sorting: [String]
    $paging: Paging
  ) {
    animePaged(
      search: $search
      status: $status
      isOwnedOnly: $isOwnedOnly
      isAdult: $isAdult
      sorting: $sorting
      paging: $paging
    ) {
      total
      hasMore
      nodes {
        ...SeriesFields
        ...AnimeFields
      }
    }
  }
  ${seriesFields}
  ${animeFields}
`;

export const getMangaPaged = gql`
  query MangaPage(
    $search: String
    $status: [Status]
    $isOwnedOnly: Boolean
    $isAdult: Boolean
    $sorting: [String]
    $paging: Paging
  ) {
    mangaPaged(
      search: $search
      status: $status
      isOwnedOnly: $isOwnedOnly
      isAdult: $isAdult
      sorting: $sorting
      paging: $paging
    ) {
      total
      hasMore
      nodes {
        ...SeriesFields
        ...MangaFields
      }
    }
  }
  ${seriesFields}
  ${mangaFields}
`;

// Check Exists
export const getAnimeExists = gql`
  query AnimeExists($id: Int, $malId: Int, $title: String) {
    animeExists(id: $id, malId: $malId, title: $title)
  }
`;

export const getMangaExists = gql`
  query MangaExists($id: Int, $malId: Int, $title: String) {
    mangaExists(id: $id, malId: $malId, title: $title)
  }
`;

// Repeated
export const getAnimeRepeated = gql`
  query AnimeRepeated($search: String, $minTimes: Int, $isAdult: Boolean) {
    animeRepeated(
      search: $search
      minTimesCompleted: $minTimes
      isAdult: $isAdult
    ) {
      ...RepeatedFields
    }
  }
  ${repeatedFields}
`;

export const getMangaRepeated = gql`
  query MangaRepeated($search: String, $minTimes: Int, $isAdult: Boolean) {
    mangaRepeated(
      search: $search
      minTimesCompleted: $minTimes
      isAdult: $isAdult
    ) {
      ...RepeatedFields
    }
  }
  ${repeatedFields}
`;

// Daily Anime
export const getDailyAnime = gql`
  query DailyAnime($dateOffset: Int!) {
    dailyAnime(dateOffset: $dateOffset) {
      id
      title
      episode
    }
  }
`;
