import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { searchReports, type SearchHit } from "./algolia-client";

export const searchVideos = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ query: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<SearchHit[]> => {
    return searchReports(data.query);
  });
