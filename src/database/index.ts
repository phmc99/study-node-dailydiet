import { knex as setupKnex } from "knex";
import { env } from "../env";

export const config = {
  client: "sqlite",
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
};

export const knex = setupKnex(config);
