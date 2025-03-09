// server/scripts/seedProblems.js
const mongoose = require('mongoose');
const Problem = require('../models/Problem');

// Sample system design problems
const problems = [
  {
    id: "url-shortener",
    title: "Design a URL Shortener like TinyURL",
    type: "both",
    difficulty: "intermediate",
    description: "Design a URL shortening service like TinyURL. This service will provide shortened URLs that redirect to the original URL.",
    estimatedTime: 45,
    requirements: {
      functional: [
        "URL shortening",
        "URL redirection",
        "Custom short URLs",
        "Analytics"
      ],
      nonFunctional: [
        "High availability",
        "Low latency",
        "Scalability"
      ]
    },
    promptSequence: [
      {
        id: "intro",
        name: "Introduction",
        question: "How would you approach designing a URL shortener service?",
        expectedTopics: ["clarification", "requirements"]
      },
      {
        id: "design",
        name: "System Design",
        question: "Could you outline the high-level architecture for this URL shortener?",
        expectedTopics: ["components", "data flow"]
      }
    ]
  },
  {
    id: "twitter",
    title: "Design Twitter",
    type: "both",
    difficulty: "advanced",
    description: "Design a simplified version of Twitter where users can post tweets, follow other users, and see a timeline of tweets.",
    estimatedTime: 60,
    requirements: {
      functional: [
        "Post tweets",
        "Follow users",
        "Timeline/feed",
        "Search"
      ],
      nonFunctional: [
        "High availability",
        "Low latency",
        "Scalability",
        "Consistency"
      ]
    }
  },
  {
    id: "parking-lot",
    title: "Design a Parking Lot System",
    type: "coaching",
    difficulty: "beginner",
    description: "Design a parking lot system that can efficiently manage parking spaces, vehicle entry/exit, and payment processing.",
    estimatedTime: 30
  }
];

async function seedDatabase() {
  try {
    // Hardcoded MongoDB URI - replace with your actual MongoDB URI
    const mongoUri = "mongodb+srv://vyassathya:SanD%21eg0@system-design-db.24esv.mongodb.net/systemdesigncoach?retryWrites=true&w=majority";
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Delete existing problems
    await Problem.deleteMany({});
    console.log('Cleared existing problems');
    
    // Insert new problems
    const result = await Problem.insertMany(problems);
    console.log(`Added ${result.length} problems to database`);
    
    // Disconnect
    await mongoose.disconnect();
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();