# Facebook Core Technologies

## TAO (The Associations and Objects)
- Facebook's distributed data store for social graph data
- Optimized for read-heavy workloads with high cache hit rates
- Stores "Objects" (users, posts, comments) and "Associations" (friendships, likes)
- Uses MySQL for persistent storage with multiple caching layers
- Deployed in a geographically distributed manner

## Haystack
- Facebook's photo storage system
- Uses a hybrid approach with two tiers:
  - Base tier: Reliable but relatively slow storage
  - Haystack tier: Fast, optimized for reads
- Photos are immutable once uploaded
- Metadata is separate from blob storage
- Uses consistent hashing for distribution

## MyRocks
- Facebook's MySQL storage engine
- Uses RocksDB as the underlying storage
- Optimized for space efficiency and write-heavy workloads
- Significant space savings compared to InnoDB

## Unicorn
- Facebook's search indexing and retrieval system
- Optimized for social graph search
- Indexes various content types (posts, people, pages)
- Supports real-time updates
- Relevance determined by social signals

## Prophet
- Facebook's forecasting system
- Used for capacity planning and anomaly detection
- Decomposable time-series model
- Handles seasonality, trends, and holiday effects

## Scaling Approaches
- Regional deployment with data centers globally
- Heavy use of caching layers (memcached)
- Read replicas for scaling read traffic
- Custom load balancers
- Microservices architecture for independent scaling