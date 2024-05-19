import { Schema } from "@effect/schema";

// ─────────────────────────────────────────────────────────────────────────────
// ── SCHEMA ───────────────────────────────────────────────────────────────────

// Define the schema to validate the response data from Jira
export const JiraActivitySchema = Schema.Struct({
  id: Schema.String,
  key: Schema.String,
  fields: Schema.Struct({
    summary: Schema.String,
    updated: Schema.String,
  }),
});

// Define the schema for the overall response
export const JiraResponseSchema = Schema.Struct({
  issues: Schema.Array(JiraActivitySchema),
});
