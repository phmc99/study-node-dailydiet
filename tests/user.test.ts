import { afterAll, beforeAll, describe, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";

describe("Rotas /user", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
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
