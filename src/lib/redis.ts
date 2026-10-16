import Redis from "ioredis";

const getRedisUrl = () => {
    return process.env.REDIS_URL || 'redis://localhost:6379  '
}

export const redis = new Redis(getRedisUrl(), {
    maxRetriesPerRequest:null
})

redis.on("error",(err)=>{
    console.log("Redis connection error", err)
})