const workbookProgress = {
  overall: {
    completion: {
      percentage: Number,
      sections: Map<string, number>, // section -> completion %
      lastUpdated: Date
    },
    excellence: {
      areas: [{
        section: String,
        score: Number,
        highlights: [String]
      }],
      threshold: 0.85 // 85% for excellence
    },
    improvements: {
      priority: [{
        section: String,
        aspect: String,
        suggestion: String,
        impact: 'high' | 'medium' | 'low'
      }],
      optional: [{
        section: String,
        suggestion: String,
        benefit: String
      }]
    }
  },
  sections: {
    requirements: {
      status: {
        completion: Number,
        quality: Number,
        lastFeedback: Date
      },
      feedback: {
        strengths: [String],
        improvements: [String],
        coachNotes: String
      }
    }
    // ... similar for other sections
  }
};