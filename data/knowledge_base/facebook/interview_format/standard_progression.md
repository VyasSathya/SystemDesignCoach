# Facebook System Design Interview Format

## Overall Structure
Facebook system design interviews typically follow a 45-minute format with a senior engineer. 
The interviewer expects the candidate to drive the conversation while they provide guidance and challenges.

## Phase 1: Problem Clarification (5-7 minutes)
- The interviewer presents an ambiguous problem
- Candidates are expected to ask clarifying questions
- Key expectations: thorough exploration of requirements
- Red flags: jumping to solutions too quickly

## Phase 2: Requirements & Scale (5-7 minutes)
- Discussion of functional requirements
- Exploration of non-functional requirements
- Calculation of scale estimates
- Key metrics: QPS, storage, bandwidth
- Facebook-specific: always consider global scale from the start

## Phase 3: High-Level Design (10-12 minutes)
- Component identification
- Discussion of interactions between components
- Data flow diagrams
- Facebook-specific: expect questions about how Meta services interact

## Phase 4: Detailed Design (15-20 minutes)
- Deep dive into specific components
- Database schema design
- API contract discussion
- Facebook-specific: expect questions about data partitioning and access patterns

## Phase 5: Scaling & Optimization (5-10 minutes)
- Discussion of bottlenecks
- Scaling strategies for identified bottlenecks
- Caching strategies
- Load balancing approaches
- Facebook-specific: expect questions about global deployment and regional considerations

## Facebook-Specific Evaluation Criteria
- Systematic problem-solving approach
- Justification of design decisions with tradeoffs
- Familiarity with distributed systems concepts
- Understanding of Facebook scale
- Ability to handle ambiguity
- Communication skills during the design process