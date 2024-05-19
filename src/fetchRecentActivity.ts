import * as Http from "@effect/platform/HttpClient";
import { Effect } from "effect";
import { JiraResponseSchema } from "./schema";

// ─────────────────────────────────────────────────────────────────────────────
// ── CONFIG ───────────────────────────────────────────────────────────────────

// loads environment variables from .env file
process.loadEnvFile();

const URL = `https://${process.env.JIRA_SUBDOMAIN}.atlassian.net/rest/api/2/search`; // prettier-ignore
const AUTH = `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_KEY}`;

// ─────────────────────────────────────────────────────────────────────────────
// ── FETCH RECENT ACTIVITY ────────────────────────────────────────────────────

export const fetchRecentActivity = (jql: string, maxResults: number) => {
  return Http.request.post(URL).pipe(
    // prepare the request
    Http.request.setHeader("Authorization", `Basic ${encode(AUTH)}`),
    Http.request.setHeader("Accept", "application/json"),
    Http.request.setHeader("Content-type", "application/json; charset=UTF-8"),
    Http.request.jsonBody({ jql, maxResults }),

    // fetch + validate status
    Effect.andThen(Http.client.fetchOk), // <-- this is awesome ⭐️

    // pre-process the response
    Effect.andThen(Http.response.schemaBodyJson(JiraResponseSchema)), // <-- this is also awesome ⭐️
    Effect.map((response) => response.issues)
  );
};

// ─────────────────────────────────────────────────────────────────────────────

// Encodes a string to base64
const encode = (authStr: string) => Buffer.from(authStr).toString("base64");
