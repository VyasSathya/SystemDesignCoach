# Facebook Photo Storage System Design

## Problem Statement
Design a system like Facebook's photo storage service that can store, retrieve, and serve billions of photos efficiently to users worldwide.

## Facebook-Specific Constraints
- 350+ million photos uploaded daily
- 4+ trillion total photos in storage
- Multiple resolution requirements for each photo
- Global access with low latency
- High read-to-write ratio (read-heavy workload)
- Cost efficiency for long-term storage
- Durability requirements (never lose a photo)

## Key Components in Facebook's Approach

### Haystack Photo Storage
- Facebook's actual photo storage system
- Two-tier architecture:
  - Storage tier: Large, reliable, relatively slower storage
  - Cache tier: Fast, optimized for reads
- Photos are immutable after upload
- Uses logical volumes for organization
- Intelligent replication strategies

### Upload Pipeline
- Multi-part upload support for large files
- Client-side compression before upload
- Synchronous acknowledgment, asynchronous processing
- Virus/content scanning integration
- Deduplication for identical photos
- Metadata extraction (EXIF, etc.)

### Transformation Service
- On-the-fly resizing for different use cases
  - Thumbnails
  - News feed versions
  - Full resolution
- Format transcoding (JPEG, PNG, WebP)
- Filter application and edits
- Caching of derived images

### Storage Optimization
- Cold storage migration for older photos
- Optimized image compression (Lossy JPEG with tuned quality)
- Content-aware encoding
- Tiered storage based on access patterns
- Intelligent replication factor (more copies for popular photos)

### CDN Integration
- Edge caching for popular content
- Regional storage optimization
- Cache invalidation strategies
- URL-based versioning for cached resources

### Metadata Management
- Photo metadata separate from binary data
- Fast indexing and search
- Tag and facial recognition integration
- Album and organization information
- Privacy controls

## Facebook Interview Focus Areas
- Efficient storage architecture for exabyte-scale data
- Read path optimization and caching strategies
- Upload handling and processing pipeline
- Balancing durability, availability, and cost
- Handling photo deletion (privacy, legal requirements)
- Global distribution strategy
- Monitoring and reliability metrics