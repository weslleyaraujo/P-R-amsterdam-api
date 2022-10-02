export type Status = "available" | "no information" | "full" | "closed";

export type Response_V1 = {
  data: {
    id: string;
    location: string;
    availability: Status;
    spaces: number;
  }[];
};
