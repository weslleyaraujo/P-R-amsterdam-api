import cheerio from "cheerio";
import { SCRAPE_URL, SORT_BY_FIELDS } from "./constants";
import { Response_V1, Status } from "./types";

export async function parse() {
  const $ = cheerio.load(
    await fetch(SCRAPE_URL, {
      headers: {
        "accept-language": "en-GB,en-US",
      },
    }).then((response) => response.text())
  );

  const parse = (content: string) => content.replace(/[\r|\n]/g, "").trim();
  const toNumber = (value: string) => Number(value.replace(/\./g, ""));

  const data: Response_V1["data"] = $("table tbody tr")
    .toArray()
    .map((row) => {
      const [location, availability, spaces] = $(row)
        .find("td")
        .toArray()
        .map((element) => parse($(element).text()));

      const locationName = location.startsWith("P+R ")
        ? location.replace(/P\+R /g, "")
        : location;

      return {
        id: locationName,
        location: locationName,
        availability: availability.toLowerCase() as Status,
        spaces: toNumber(spaces),
      };
    });

  data.sort(
    (current, next) =>
      SORT_BY_FIELDS.indexOf(current.availability) -
      SORT_BY_FIELDS.indexOf(next.availability)
  );

  return { data };
}
