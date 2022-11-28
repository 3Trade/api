import { redis_client } from "../services/redis.js";

export class RedisWorker {
  async getLastDatabaseUpdate() {
    const lastRecord = await redis_client.get("last_tick");
    return new Date(Number(lastRecord));
  }
}
