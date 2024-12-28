export type SearchResult = {
  title: string;
  abstract: string;
  keywords: string;
  n_citation: number;
  year: number;
  url: string;
};

export type SearchResponse = {
  output: SearchResult[];
  total: number;
};
