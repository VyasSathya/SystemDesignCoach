const mongoose = require('mongoose');
const Problem = require('../models/Problem');

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
    const mongoUri = process.env.MONGODB_URI;
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Delete existing problems
    await Problem.deleteMany({});
    console.log('Cleared existing problems');
    
    // Insert new problems
    const result = await Problem.insertMany(problems);
    console.log(`Added ${result.length} problems to database`);
    
    // Verify the insertion
    const count = await Problem.countDocuments();
    console.log(`Total problems in database: ${count}`);
    
    await mongoose.disconnect();
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();