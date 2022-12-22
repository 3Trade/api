import express from "express";
import routes from "./routes.js";
import swaggerUI from "swagger-ui-express";
import swaggerJson from "./swagger";
// import schema from "./schema/schema.js";

// GRAPHQL
// import { graphqlHTTP } from "express-graphql";

import amqp from "amqplib";
import { RedisWorker } from "./workers/redisWorker.js";

const redisWorker = new RedisWorker();
let rabbit_connected = false;
let conn;
export let channel;
async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

const connectRabbit = async () => {
  console.log("Starting Rabbit connection...");
  let attempt = 1;
  while (!rabbit_connected) {
    console.log(`Trying to connect to RabbitMQ. Attempt ${attempt}`);
    try {
      conn = await amqp.connect("amqp://guest:guest@rabbit:5672");
      channel = await conn.createChannel();
      await channel.assertQueue("binance", { durable: false });
      rabbit_connected = true;
      console.log("Rabbit Connected!!");
    } catch {
      console.log("Error on connecting Rabbit. Retrying...");
      await delay(5000);
    }
    attempt++;
  }
};

const app = express();

(async () => {
  await connectRabbit();
  await redisWorker.connect();
})();

app.use("/api", routes);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJson));
// app.use(
//   "/graphql",
//   graphqlHTTP({
//     schema: schema,
//     graphiql: true
//   })
// );

app.listen(4000, () => {
  console.log("listening on 4000");
});
