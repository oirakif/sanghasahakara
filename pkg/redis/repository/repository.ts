import { RedisClientType } from '@redis/client';

class RedisRepository {
    private redisClient: RedisClientType;
  
    constructor(redisClient: RedisClientType) {
      this.redisClient = redisClient;
    }

    public Set(key: string, value: string, expiryTime: number) {
        this.redisClient.set(key, value,
            {
                EX: expiryTime
            }
        )
    }

    public async Get(key: string): Promise<string> {
        const value = await this.redisClient.get(key) as string
        return value;
    }
}

export default RedisRepository;
