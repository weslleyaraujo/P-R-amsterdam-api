// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cheerio from "cheerio";
const PAGE_URL = "https://penr.stachanov.com/penr/currentAvailability/index";

type Status = "closed" | "no information" | "available" | "full";
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
    console.log("from cache");
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

      return {
        id: location,
        location: location.startsWith("P+R ")
          ? location.replace(/P+R /g, "")
          : location,
        availability: availability.toLowerCase() as Status,
        spaces: toNumber(spaces),
      };
    });

  console.log("clear and new cache");
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
