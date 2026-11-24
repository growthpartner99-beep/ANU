import { describe, expect, it } from "vitest";
import {
  createProjectRequestSchema,
  createProjectResponseSchema,
  deleteProjectRequestSchema,
  deleteProjectResponseSchema,
  listProjectsRequestSchema,
  listProjectsResponseSchema,
  updateProjectRequestSchema,
  updateProjectResponseSchema,
} from "./projects";

const ID = "00000000-0000-4000-8000-000000000000";
const project = {
  id: ID,
  name: "Support",
  publicKey: "pk_abc",
  messagesUsed: 3,
  periodStart: "2026-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("GET /api/projects", () => {
  it("takes no input and returns a list of projects", () => {
    expect(listProjectsRequestSchema.safeParse({}).success).toBe(true);
    expect(listProjectsResponseSchema.safeParse([project]).success).toBe(true);
    expect(listProjectsResponseSchema.safeParse([{ ...project, publicKey: "bad" }]).success).toBe(false);
  });
});

describe("POST /api/projects", () => {
  it("accepts a name and returns the created project", () => {
    expect(createProjectRequestSchema.safeParse({ name: "Support" }).success).toBe(true);
    expect(createProjectResponseSchema.safeParse(project).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(createProjectRequestSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("PATCH /api/projects/:id", () => {
  it("renames a project by id", () => {
    expect(updateProjectRequestSchema.safeParse({ id: ID, name: "New name" }).success).toBe(true);
    expect(updateProjectResponseSchema.safeParse(project).success).toBe(true);
  });

  it("rejects a non-uuid id", () => {
    expect(updateProjectRequestSchema.safeParse({ id: "1", name: "New name" }).success).toBe(false);
  });
});

describe("DELETE /api/projects/:id", () => {
  it("accepts an id and confirms deletion", () => {
    expect(deleteProjectRequestSchema.safeParse({ id: ID }).success).toBe(true);
    expect(deleteProjectResponseSchema.safeParse({ success: true }).success).toBe(true);
  });

  it("rejects a missing id", () => {
    expect(deleteProjectRequestSchema.safeParse({}).success).toBe(false);
  });
});
