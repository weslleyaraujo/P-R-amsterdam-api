import { DEFAULT_CACHE_CONTROL } from "../../utils/constants";
import { parse } from "../../utils/parser";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", DEFAULT_CACHE_CONTROL);
  res.status(200).json(await parse());
}
