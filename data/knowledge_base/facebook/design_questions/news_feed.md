# Facebook News Feed System Design

## Problem Statement
Design Facebook's News Feed, a personalized, constantly updating list of stories from friends, pages, and groups.

## Facebook-Specific Constraints
- Billions of active users
- Hundreds of billions of feed items generated daily
- Sub-second feed generation time
- High read-to-write ratio (100:1)
- Content personalization requirements
- Support for multiple content types
- Real-time updates and notifications

## Key Components in Facebook's Approach

### Feed Publishing
- Write path for content creation
- Fanout on write vs. fanout on read considerations
- Facebook uses a hybrid approach
- For regular users: fanout on read
- For high-profile users: selective fanout on write
- Content classifier for spam detection

### Feed Retrieval
- Read path for generating feeds
- Aggregator service to collect posts from various sources
- Ranker service to prioritize content
- Content filters (spam, blocked users)
- Cache layers for performance

### Ranking System
- EdgeRank was the original algorithm
- Now uses ML-based ranking with thousands of signals
- Key signals: affinity, content type, recency, engagement
- Personalized for each user
- Separate training and inference pipelines

### Storage Architecture
- Specialized for different workloads:
  - Social graph data: TAO
  - Posts content: specialized content stores
  - Media: Haystack
- Heavily sharded MySQL databases
- Memcached caching layer

### Distribution System
- Global distribution of feeds
- Regional datacenters
- CDN for static content
- Optimization for mobile networks

## Facebook Interview Focus Areas
- Handling scale and performance
- Balancing freshness vs. efficiency
- Ranking algorithm approaches
- Cache invalidation strategies
- Monitoring and performance metrics
- Real-time updates mechanism