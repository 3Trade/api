import redis from "redis";

export const redis_client = redis.createClient({
  url: "redis://redis"
});
