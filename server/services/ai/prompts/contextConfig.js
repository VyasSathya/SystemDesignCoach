const SYSTEM_CONTEXT = {
  projectGoals: {
    primary: "Create adaptive system design learning experience",
    learning: "Guide users through professional-level system design",
    simulation: "Provide realistic interview practice"
  },
  
  actors: {
    coach: {
      role: "Primary educator and guide",
      interactsWith: ["workbook", "hints", "diagrams"],
      progression: ["requirements", "architecture", "deep-dive", "review"]
    },
    interviewer: {
      role: "Simulates real interviews",
      interactsWith: ["timer", "evaluation", "difficulty-scaling"]
    },
    grader: {
      role: "Provides objective feedback",
      interactsWith: ["scoring-rubric", "improvement-suggestions"]
    }
  },

  learningProgression: [
    {
      stage: "Requirements Gathering",
      checkpoints: ["functional-reqs", "non-functional-reqs", "constraints"],
      successCriteria: "User can articulate complete system requirements"
    },
    // Add more stages...
  ]
};