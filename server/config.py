import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database Configuration
MONGO_URI = os.getenv('MONGO_URI')

# Authentication Configuration
JWT_SECRET = os.getenv('JWT_SECRET')

# API Keys
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Server Configuration
PORT = int(os.getenv('PORT', 5000))
