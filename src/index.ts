import { NodeRuntime } from "@effect/platform-node";
import { Console, Effect } from "effect";
import { Schema } from "@effect/schema";

import { fetchRecentActivity } from "./fetchRecentActivity";
import { JiraActivitySchema } from "./schema";

// ─────────────────────────────────────────────────────────────────────────────
// ── CONFIG ───────────────────────────────────────────────────────────────────

process.loadEnvFile();

const USER = process.env.JIRA_USERNAME;

// fetchRecentActivity args
const JQL_QUERY = `assignee = '${USER}' AND updated >= -1w ORDER BY updated DESC`;
const MAX_RESULTS = 10;

// ─────────────────────────────────────────────────────────────────────────────
// ── MAIN ─────────────────────────────────────────────────────────────────────

export const main = fetchRecentActivity(JQL_QUERY, MAX_RESULTS).pipe(
  Effect.flatMap((activities) => Effect.all(activities.map(logActivity))),
  Effect.catchAll((err: unknown) => Console.error(`Error: ${err}`))
);

NodeRuntime.runMain(Effect.scoped(main)); // <-- this is where the program is actually run (scoped to avoid issues with leaky processes)

// ─────────────────────────────────────────────────────────────────────────────
// ── UTILS ────────────────────────────────────────────────────────────────────

type JiraActivity = Schema.Schema.Type<typeof JiraActivitySchema>;

function logActivity(activity: JiraActivity) {
  const msg = `ID: ${activity.id}, Key: ${activity.key}, Summary: ${activity.fields.summary}, Updated: ${activity.fields.updated}`
  return Console.log(msg);
}
