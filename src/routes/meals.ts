import { FastifyInstance } from "fastify";
import { z } from "zod";

import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { request } from "node:http";
import { checkSessionIdExists } from "../middlewares/verify-session-id";

export async function mealsRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      isOnDiet: z.boolean(),
    });

    const { name, description, date, isOnDiet } = createMealBodySchema.parse(
      req.body
    );

    await knex("meals").insert({
      id: randomUUID(),
      name,
      description,
      is_on_diet: isOnDiet,
      date: date.getTime(),
      user_id: req.user?.id,
    });

    return res.status(201).send();
  });

  app.get("/", { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const meals = await knex("meals").where({ user_id: req.user?.id });

    return res.send({ meals });
  });

  app.get("/:id", { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const paramsSchema = z.object({ id: z.string().uuid() });

    const { id } = paramsSchema.parse(req.params);

    const meal = await knex("meals").where({ id }).first();

    if (!meal) return res.status(404).send({ message: "Meal not found" });

    return res.send({ meal });
  });

  app.put("/:id", { preHandler: [checkSessionIdExists] }, async (req, res) => {
    const paramsSchema = z.object({ id: z.string().uuid() });

    const { id } = paramsSchema.parse(req.params);

    const updateMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      isOnDiet: z.boolean(),
    });

    const { name, description, date, isOnDiet } = updateMealBodySchema.parse(
      req.body
    );

    const meal = await knex("meals").where({ id }).first();

    if (!meal) return res.status(404).send({ message: "Meal not found" });

    await knex("meals").where({ id }).update({
      name,
      description,
      is_on_diet: isOnDiet,
      date: date.getTime(),
    });

    return res.status(204).send();
  });

  app.delete(
    "/:id",
    { preHandler: [checkSessionIdExists] },
    async (req, res) => {
      const paramsSchema = z.object({ id: z.string().uuid() });

      const { id } = paramsSchema.parse(req.params);

      const meal = await knex("meals").where({ id }).first();

      if (!meal) return res.status(404).send({ message: "Meal not found" });

      await knex("meals").where({ id }).delete();

      return res.status(204).send();
    }
  );

  app.get(
    "/metrics",
    { preHandler: [checkSessionIdExists] },
    async (req, res) => {
      const userId = req.user?.id;

      const meals = await knex("meals")
        .where({ user_id: userId })
        .orderBy("date", "desc");

      const totalMealsOnDiet = await knex("meals")
        .where({ user_id: userId, is_on_diet: true })
        .count("id", { as: "total" })
        .first();

      const totalMealsOutDiet = await knex("meals")
        .where({ user_id: userId, is_on_diet: false })
        .count("id", { as: "total" })
        .first();

      const betterDietSequence = meals.reduce(
        (acc, meal) => {
          if (meal.is_on_diet) {
            acc.currentSequence += 1;
          } else {
            acc.currentSequence = 0;
          }

          if (acc.currentSequence > acc.betterSequence) {
            acc.betterSequence = acc.currentSequence;
          }

          return acc;
        },
        { betterSequence: 0, currentSequence: 0 }
      );

      return res.send({
        total_meals: meals.length,
        total_meals_on_diet: totalMealsOnDiet?.total,
        total_meals_out_diet: totalMealsOutDiet?.total,
        diet_sequence: {
          better_sequence: betterDietSequence.betterSequence,
          current_sequence: betterDietSequence.currentSequence,
        },
      });
    }
  );
}
