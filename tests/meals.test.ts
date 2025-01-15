import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { execSync } from "node:child_process";
import { afterEach } from "node:test";

describe("Rotas /meals", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback");
    execSync("npm run knex migrate:latest");
  });

  it("possivel criar uma refeicao", async () => {
    const newUser = await request(app.server).post("/users").send({
      name: "Pedro",
      email: "pedro@gmail.com",
    });

    const cookies = newUser.get("Set-Cookie") ?? [];

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Almoço",
        description: "Arroz e frango",
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201);
  });
});
