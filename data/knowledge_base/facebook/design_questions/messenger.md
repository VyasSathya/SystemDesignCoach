# Facebook Messenger System Design

## Problem Statement
Design Facebook Messenger, a real-time messaging service supporting billions of users with features like one-on-one chats, group messaging, online status, and media sharing.

## Facebook-Specific Constraints
- 2+ billion monthly active users
- 100+ billion messages sent daily
- Sub-100ms message delivery expectations
- Support for text, images, videos, voice messages, and other file types
- End-to-end encryption for secret conversations
- Multi-device synchronization
- Online/offline status tracking

## Key Components in Facebook's Implementation

### Connection Management
- Persistent WebSocket connections for real-time communication
- Connection pooling to handle billions of simultaneous connections
- Fallback to long polling when WebSockets aren't available
- Regional connection points to minimize latency

### Message Delivery System
- Push-based delivery for online users
- Store-and-forward model for offline recipients
- Priority queuing for different message types
- Acknowledgment and delivery receipts

### Storage Architecture
- Message Store: Sharded by conversation ID
- Facebook uses HBase for message storage
- Different retention policies for different message types
- Metadata separate from message content for efficient queries

### Online Presence System
- Heartbeat mechanism for online status
- Last active timestamp for offline users
- Distributed cache for status information
- Optimized for read-heavy workloads

### Group Messaging
- Small groups (<250) vs. large groups design differences
- Selective fan-out approach
- Metadata-only updates when possible

### Media Handling
- Integration with Haystack for photos and videos
- Progressive loading for large media files
- Transcoding for different device capabilities
- Thumbnail generation and previews

### Security & Privacy
- End-to-end encryption implementation
- Message expiration and deletion
- Rate limiting and abuse prevention
- Privacy controls for status visibility

## Facebook Interview Focus Areas
- Real-time delivery architecture
- Scalability approach for billions of users
- Handling offline users and message delivery
- Presence indicator implementation
- Fault tolerance and consistency mechanisms
- Storage and retrieval optimization
- Synchronization across multiple devices