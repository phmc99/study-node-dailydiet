import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { execSync } from "node:child_process";

describe("Rotas /user", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("possivel criar um usuario", async () => {
    await request(app.server)
      .post("/users")
      .send({
        name: "Pedro",
        email: "pedro@gmail.com",
      })
      .expect(201);
  });
});
