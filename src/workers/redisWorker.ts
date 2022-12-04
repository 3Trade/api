import { createClient } from "redis";
import { delay } from "../helpers/delay";

const redis_client = createClient({
  url: "redis://redis"
});

export class RedisWorker {
  private redis_connected = false;
  connect = async () => {
    console.log("Starting Redis connection...");
    while (!this.redis_connected) {
      console.log("Trying to connect...");
      try {
        await redis_client.connect();
        this.redis_connected = true;
        console.log("Redis Connected!!");
      } catch {
        console.log("Error on connecting Redis. Retrying...");
        await delay(5000);
      }
    }
  };
  async getLastDatabaseUpdate1d() {
    const lastRecord1d = await redis_client.get("last_tick_1d");
    return new Date(Number(lastRecord1d));
  }

  async getLastDatabaseUpdate4h() {
    const lastRecord4h = await redis_client.get("last_tick_4h");
    return new Date(Number(lastRecord4h));
  }
}
