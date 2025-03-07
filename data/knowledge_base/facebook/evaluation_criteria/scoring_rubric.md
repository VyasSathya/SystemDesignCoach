# Facebook System Design Interview Scoring Rubric

## Overall Evaluation Framework
Facebook evaluates system design interviews on a 4-point scale:
- **Strong No Hire** (1): Significant gaps in fundamentals
- **No Hire** (2): Some understanding but lacks depth
- **Hire** (3): Solid approach with good justifications
- **Strong Hire** (4): Exceptional design skills and insights

## Key Evaluation Dimensions

### 1. Requirements Clarification (20%)
- **Exceptional**: Comprehensive exploration of functional and non-functional requirements, anticipates edge cases, defines clear scope
- **Strong**: Good clarification of requirements with some discussion of edge cases
- **Acceptable**: Basic requirements gathering but may miss important aspects
- **Poor**: Jumps straight to solution without understanding the problem

### 2. System Architecture (25%)
- **Exceptional**: Clear, well-structured architecture with appropriate components, elegant separation of concerns
- **Strong**: Logical component breakdown with proper interfaces
- **Acceptable**: Reasonable architecture but may have some organizational issues
- **Poor**: Confused architecture, improper boundaries, monolithic thinking

### 3. Component Deep Dive (20%)
- **Exceptional**: Detailed understanding of critical components, appropriate technology choices with clear justification
- **Strong**: Good depth on most components with reasonable choices
- **Acceptable**: Some depth on a few components but lacks detail in others
- **Poor**: Superficial treatment of all components

### 4. Scale & Performance (15%)
- **Exceptional**: Sophisticated understanding of scaling challenges, proactive bottleneck identification, innovative solutions
- **Strong**: Identifies common bottlenecks with good solutions
- **Acceptable**: Basic scaling considerations but may miss subtleties
- **Poor**: Fails to address scale or proposes impractical solutions

### 5. Data Model & Storage (10%)
- **Exceptional**: Optimized schema design, appropriate storage choices, consideration of access patterns
- **Strong**: Solid data model with reasonable storage decisions
- **Acceptable**: Workable data model but may have inefficiencies
- **Poor**: Inappropriate storage choices or poor schema design

### 6. Communication (10%)
- **Exceptional**: Crystal clear explanations, excellent use of diagrams, structured approach
- **Strong**: Clear communication with good visual aids
- **Acceptable**: Somewhat clear but may be disorganized at times
- **Poor**: Confusing explanations, poor time management

## Facebook-Specific Expectations

### Technical Depth
- Demonstrates understanding of distributed systems principles
- Familiarity with CAP theorem implications
- Knowledge of consistency models and their tradeoffs

### Scale Mindset
- Designs for Facebook-scale from the start
- Considers global deployment and regional challenges
- Anticipates growth and evolution of the system

### Practical Implementation
- Balances theoretical ideals with practical considerations
- Considers operational aspects (monitoring, deployment, etc.)
- Awareness of real-world constraints and limitations

### Innovative Thinking
- Proposes creative solutions to difficult problems
- Shows flexibility when facing constraints
- Demonstrates ability to think beyond conventional patterns

## Red Flags
- Inability to handle ambiguity
- Over-engineering simple problems
- Under-engineering complex problems
- Failure to justify design decisions
- Rigidity in approaching alternative solutions
- Missing critical requirements
- Focusing too much on irrelevant details

## Green Flags
- Systematic approach to problem-solving
- Strong justification for design decisions
- Awareness of tradeoffs in every decision
- Ability to adapt the design based on new constraints
- Prioritization of critical components
- Appropriate level of detail based on time constraints