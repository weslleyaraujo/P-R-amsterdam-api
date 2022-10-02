import { Status } from "./types";

export const DEFAULT_CACHE_CONTROL = "max-age=0, s-maxage=30";
export const SCRAPE_URL =
  "https://penr.stachanov.com/penr/currentAvailability/index";

export const SORT_BY_FIELDS: Status[] = [
  "available",
  "no information",
  "full",
  "closed",
];
