// server/data/problems.js
// This file exports an array of detailed problem contexts for your system design challenges.
// Each problem includes extensive details such as constraints, scale requirements, architecture notes,
// business requirements, user stories, performance metrics, and additional considerations.

module.exports = [
    {
      id: "urlShortener",
      title: "URL Shortener Service",
      description: "Design a scalable URL shortener service similar to TinyURL or bit.ly. The service must generate unique short URLs that redirect to the original long URLs.",
      additionalInfo: "The service should support high-frequency URL creation and redirection, include URL analytics, abuse prevention, custom aliases, and expiration policies.",
      constraints: {
        shortCodeLength: 7,
        redirectionLatency: "Target <50ms under peak load",
        availability: "99.99% uptime with multi-region support",
        security: "Validate URLs to prevent injection; enforce rate limiting and anti-abuse measures",
        dataConsistency: "Eventual consistency for URL mappings; strong consistency for analytics data"
      },
      scaleRequirements: {
        estimatedQPS: "Approximately 1000 QPS during peak hours",
        expectedDataVolume: "Billions of URL mappings over time",
        storage: "In-memory caches (e.g., Redis) for fast lookups plus persistent storage (e.g., NoSQL) for durability",
        cachingStrategy: "Aggressive caching for redirection paths with periodic persistence updates"
      },
      architectureNotes: "Consider a distributed microservice architecture with components for URL generation, redirection, and analytics. Use a distributed hash table for mappings and plan for collision resolution, custom aliases, and URL expiration.",
      businessRequirements: "Monetization via premium custom URLs and analytics dashboards; integration with third-party platforms via a robust API.",
      userStories: [
        "As a user, I want to quickly shorten a long URL for easy sharing.",
        "As an admin, I need to monitor URL usage and detect abuse.",
        "As a developer, I want a reliable API for URL shortening integration."
      ],
      performanceMetrics: {
        averageResponseTime: "<50ms for redirects",
        throughput: "Support at least 1 million redirections per day",
        errorRate: "<0.1% failed redirections"
      },
      additionalConsiderations: "Handle duplicate requests, custom alias conflicts, and periodic cleanup of expired URLs."
    },
    {
      id: "socialMediaFeed",
      title: "Social Media Feed",
      description: "Design a system to provide a personalized, real-time feed for a social media platform that aggregates posts, images, videos, and trending topics.",
      additionalInfo: "The feed must support both algorithmic and chronological ordering and enable user interactions (likes, comments, shares) with continuous updates.",
      constraints: {
        personalization: "Tailor feed ranking based on user behavior and interests",
        refreshLatency: "Feed updates within 200ms for active users",
        availability: "99.9% uptime during peak usage",
        consistency: "Eventual consistency for feed data; strong consistency for critical interactions"
      },
      scaleRequirements: {
        estimatedQPS: "Tens of thousands of QPS during peak periods",
        expectedDataVolume: "Billions of posts, comments, and media references",
        storage: "Distributed storage for posts/media, with CDNs for media delivery",
        caching: "In-memory caching for frequently accessed timelines and trending topics"
      },
      architectureNotes: "Adopt a hybrid approach using both push and pull for feed updates. Employ message queues for notifications and microservices for separation of concerns across post management, user interactions, and trending analytics.",
      businessRequirements: "Integration with advertising platforms, monetization through sponsored posts, and developer APIs for third-party integrations.",
      userStories: [
        "As a user, I want a feed that updates to reflect my interests.",
        "As a content creator, I need analytics on engagement.",
        "As a marketer, I want targeted advertising based on trends."
      ],
      performanceMetrics: {
        refreshTime: "Under 200ms for timeline updates",
        dailyActiveUsers: "Support up to 100 million users",
        errorRate: "<0.5% feed failures during peak load"
      },
      additionalConsiderations: "Address content moderation, spam filtering, and bot content; balance algorithmic recommendations with user control."
    },
    {
      id: "rideSharing",
      title: "Ride Sharing Application",
      description: "Design a ride-sharing system that efficiently matches drivers with riders in real-time, handling dynamic pricing and high availability.",
      additionalInfo: "The application must process real-time location data, perform rapid driver-rider matching, and support surge pricing along with robust notifications and in-app payments.",
      constraints: {
        realTimeProcessing: "Process location updates and matching within 100ms",
        dynamicPricing: "Implement a transparent, near real-time surge pricing algorithm",
        availability: "High fault tolerance with multi-region redundancy",
        security: "Secure user data (location, payment) with encryption and strong authentication"
      },
      scaleRequirements: {
        estimatedQPS: "Support thousands of concurrent ride requests during peak events",
        dataVolume: "Continuous streams of geolocation data from many users",
        storage: "Geospatial databases for tracking and scalable messaging systems (e.g., Kafka) for real-time data",
        caching: "Caching for high-frequency lookups of driver availability and nearby requests"
      },
      architectureNotes: "Use a microservices architecture with dedicated services for matching, pricing, notifications, and payments. Employ event-driven communication for real-time updates and design regional clusters to minimize latency.",
      businessRequirements: "Include driver and rider ratings, in-app payments, and support for scheduled/on-demand rides; integrate with mapping/navigation APIs.",
      userStories: [
        "As a rider, I want to request a ride quickly and see my pickup time.",
        "As a driver, I need clear ride requests with pickup/drop-off details.",
        "As an operator, I want to monitor ride activity and adjust surge pricing dynamically."
      ],
      performanceMetrics: {
        matchingLatency: "<100ms for pairing",
        systemUptime: "99.95% uptime",
        successRate: "Over 99% ride completion success"
      },
      additionalConsiderations: "Plan for cancellations, no-shows, and traffic variations; consider integration with public transit data and robust peak-load handling."
    }
  ];
  