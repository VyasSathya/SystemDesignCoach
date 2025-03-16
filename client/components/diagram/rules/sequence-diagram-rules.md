# Sequence Diagram Rules & Constraints

## Implementation Order

1. Basic Structure Rules
   - Participants fixed at top
   - Lifelines extend vertically
   - Unique participant names required

2. Participant Types & Styling
   - User (blue)
   - System (green)
   - Database (purple)

3. Movement Constraints
   - Participants: horizontal only
   - Lifelines: vertical alignment with parent
   - Messages: fixed Y-position after creation

4. Message Connection Rules
   - Must start from lifeline
   - Must end at lifeline
   - Horizontal travel only
   - Must connect at lifeline intersections
   - No crossing messages
   - No self-messages
   - Maintain temporal order

5. Message Types & Styling
   - Synchronous Messages
     * Solid line (─────)
     * Filled arrow head (►)
     * Black/dark color
     * Requires response message
   - Asynchronous Messages
     * Dashed line (- - -)
     * Open arrow head (▷)
     * Slightly lighter color
     * Response optional

6. Control Structures
   - Loop
     * Visual container around messages
     * Requires loop condition
     * Can contain multiple messages
     * No overlap with other structures
   - Alternative
     * Container with multiple sections
     * Requires condition for each section
     * Mutually exclusive paths
     * No overlap with other structures

## Validation Requirements
- No crossing messages
- No self-messages
- Messages must maintain temporal order
- All messages must connect to lifelines
- Participants must have unique names
- Control structures cannot overlap