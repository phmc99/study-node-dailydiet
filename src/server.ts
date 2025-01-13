import fastify from "fastify";
import cookie from "@fastify/cookie";

import { usersRoutes } from "./routes/users";
import { env } from "./env";

const app = fastify();

app.register(cookie);

app.register(usersRoutes, { prefix: "users" });

app.listen({ port: env.PORT }).then(() => {
  console.log("Server is running!");
});
