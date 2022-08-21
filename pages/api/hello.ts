// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cheerio from "cheerio";
const PAGE_URL = "https://penr.stachanov.com/penr/currentAvailability/index";

type Status = "available" | "no information" | "full" | "closed";
const sortBy: Status[] = ["available", "no information", "full", "closed"];

const cache = new Map();
export default async function handler(req, res) {
  const $ = cheerio.load(
    await fetch(PAGE_URL, {
      headers: {
        "accept-language": "en-GB,en-US",
      },
    }).then((response) => response.text())
  );

  const parse = (content: string) => content.replace(/[\r|\n]/g, "").trim();
  const toNumber = (value: string) => Number(value.replace(/\./g, ""));

  const [date, time] = parse($("#lastUpdate").text())
    .split(" ")
    .filter(Boolean)
    .filter((item) => !/Last|update\:/.test(item)) as string[];

  const created = new Date(`${date} ${time}`);
  const createdKey = created.toUTCString();

  if (
    cache.has(createdKey) &&
    new Date().getTime() - created.getTime() > 1000 * 60 * 1
  ) {
    const data = cache.get(createdKey);
    return data;
  }
  const data: {
    id: string;
    location: string;
    availability: Status;
    spaces: number;
  }[] = $("table tbody tr")
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
      sortBy.indexOf(current.availability) - sortBy.indexOf(next.availability)
  );

  cache.clear();
  cache.set(createdKey, {
    data,
    update: {
      date,
      time,
    },
  });

  res.status(200).json(cache.get(createdKey));
}
