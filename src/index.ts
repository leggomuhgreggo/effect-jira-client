import * as Http from "@effect/platform/HttpClient";
import { Schema } from "@effect/schema";
import { Console, Effect } from "effect";
import { NodeRuntime } from "@effect/platform-node";

// ─────────────────────────────────────────────────────────────────────────────
// ── CONFIG ───────────────────────────────────────────────────────────────────

process.loadEnvFile();

const SUBDOMAIN = process.env.JIRA_SUBDOMAIN;
const EMAIL = process.env.JIRA_EMAIL;
const API_KEY = process.env.JIRA_API_KEY;

const USERNAME = `Gregory Westneat`;
const JQL_QUERY = `assignee = '${USERNAME}' AND updated >= -1d ORDER BY updated DESC`;
const MAX_RESULTS = 10;

// ─────────────────────────────────────────────────────────────────────────────
// ── SCHEMA ───────────────────────────────────────────────────────────────────

// Define the schema to validate the response data from Jira
const JiraActivitySchema = Schema.Struct({
  id: Schema.String,
  key: Schema.String,
  fields: Schema.Struct({
    summary: Schema.String,
    updated: Schema.String,
  }),
});

// Define the schema for the overall response
const JiraResponseSchema = Schema.Struct({
  issues: Schema.Array(JiraActivitySchema),
});

// Infer the type from JiraActivitySchema
type JiraActivity = Schema.Schema.Type<typeof JiraActivitySchema>;

// ─────────────────────────────────────────────────────────────────────────────
// ── FETCH RECENT ACTIVITY ────────────────────────────────────────────────────

const fetchRecentActivity = (jql: string, maxResults: number) => {
  const url = `https://${SUBDOMAIN}.atlassian.net/rest/api/2/search`;
  const config = {
    headers: {
      Authorization: `Basic ${Buffer.from(`${EMAIL}:${API_KEY}`).toString(
        "base64"
      )}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  return Http.request.post(url).pipe(
    Http.request.textBody(JSON.stringify({ jql, maxResults })),
    Http.request.setHeaders(config.headers),
    Http.client.fetchOk,
    Effect.flatMap(Http.response.schemaBodyJson(JiraResponseSchema)),
    Effect.map((response) => response.issues)
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── LOG ACTIVITY ─────────────────────────────────────────────────────────────

const logActivity = (activity: JiraActivity) =>
  Console.log(
    `ID: ${activity.id}, Key: ${activity.key}, Summary: ${activity.fields.summary}, Updated: ${activity.fields.updated}`
  );

// ─────────────────────────────────────────────────────────────────────────────
// ── MAIN FUNCTION ────────────────────────────────────────────────────────────

const main = fetchRecentActivity(JQL_QUERY, MAX_RESULTS).pipe(
  Effect.flatMap((activities) =>
    Effect.all(activities.map(logActivity))
  ),
  Effect.catchAll((err: unknown) => Console.error(`Error: ${err}`))
);

// Run the script using NodeRuntime.runMain
NodeRuntime.runMain(Effect.scoped(main));
