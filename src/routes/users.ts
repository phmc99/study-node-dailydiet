import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";

import { knex } from "../database";

export async function usersRoutes(app: FastifyInstance) {
  app.post("/", async (req, res) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    const { name, email } = createUserBodySchema.parse(req.body);

    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      res.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
    }
    const userAlreadyExists = await knex("users").where({ email }).first();

    if (userAlreadyExists)
      return res.status(400).send({ message: "User already existis" });

    await knex("users").insert({
      id: randomUUID(),
      session_id: sessionId,
      name,
      email,
    });

    return res.status(201).send();
  });
}
