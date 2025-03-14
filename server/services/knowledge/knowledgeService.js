const AIFactory = require('../ai/aiFactory');
const aiConfig = require('../../config/aiConfig');
const path = require('path');
const fs = require('fs');

const KNOWLEDGE_BASE_DIR = path.join(__dirname, '../../../data/knowledge_base');
const VECTOR_DB_DIR = path.join(__dirname, '../../../data/chroma_db');

class KnowledgeService {
  constructor() {
    this.aiService = AIFactory.createService(
      aiConfig.defaultProvider, 
      aiConfig[aiConfig.defaultProvider]
    );
    this.vectorStores = {};
  }

  async initializeVectorStore() {
    const companies = fs.readdirSync(KNOWLEDGE_BASE_DIR)
      .filter(d => fs.statSync(path.join(KNOWLEDGE_BASE_DIR, d)).isDirectory());
    
    for (const company of companies) {
      const companyDir = path.join(KNOWLEDGE_BASE_DIR, company);
      
      // Check if documents exist
      if (!fs.readdirSync(companyDir).some(f => f.endsWith('.md'))) {
        console.log(`No markdown files found for ${company}`);
        continue;
      }
      
      // Create vector store directory
      const companyVectorDir = path.join(VECTOR_DB_DIR, company);
      // ... rest of vector store initialization
    }
  }

  async queryKnowledge(query, company = 'facebook') {
    if (!this.initialized) await this.initialize();
    
    try {
      const result = await this._executeCommand('query', { query, company });
      return result;
    } catch (error) {
      console.error('Error querying knowledge base:', error);
      return '';
    }
  }
  
  async _executeCommand(command, params = {}) {
    const requestId = Date.now().toString();
    const requestFile = path.join(__dirname, `request_${requestId}.json`);
    const responseFile = path.join(__dirname, `response_${requestId}.json`);
    
    // Write request to file
    fs.writeFileSync(requestFile, JSON.stringify({
      command,
      params
    }));
    
    // Execute Python command
    await exec(`python ${path.join(__dirname, 'vector_store.py')} ${requestId}`);
    
    // Read response
    const response = JSON.parse(fs.readFileSync(responseFile, 'utf8'));
    
    // Clean up
    fs.unlinkSync(requestFile);
    fs.unlinkSync(responseFile);
    
    return response.result;
  }
  
  _getPythonScript() {
    return `
import sys
import os
import json
from langchain.document_loaders import TextLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
import openai

# Set up OpenAI API key
openai.api_key = os.environ.get("OPENAI_API_KEY", "your-openai-key")

# Paths
KNOWLEDGE_BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../data/knowledge_base')
VECTOR_DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../data/chroma_db')

# Global variables
vector_stores = {}

def initialize_vector_store():
    """Initialize or load vector stores for each company"""
    companies = [d for d in os.listdir(KNOWLEDGE_BASE_DIR) if os.path.isdir(os.path.join(KNOWLEDGE_BASE_DIR, d))]
    
    for company in companies:
        company_dir = os.path.join(KNOWLEDGE_BASE_DIR, company)
        
        # Check if documents exist
        if not any(f.endswith('.md') for f in os.listdir(company_dir)):
            print(f"No markdown files found for {company}")
            continue
        
        # Create vector store directory
        company_vector_dir = os.path.join(VECTOR_DB_DIR, company)
        os.makedirs(company_vector_dir, exist_ok=True)
        
        # Load documents
        loader = DirectoryLoader(company_dir, glob="**/*.md", loader_cls=TextLoader)
        documents = loader.load()
        
        if not documents:
            print(f"No documents loaded for {company}")
            continue
        
        # Split documents
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = text_splitter.split_documents(documents)
        
        # Create embeddings and vector store
        embeddings = OpenAIEmbeddings()
        vector_store = Chroma.from_documents(
            chunks, 
            embeddings, 
            persist_directory=company_vector_dir
        )
        
        vector_stores[company] = vector_store
        print(f"Initialized vector store for {company} with {len(chunks)} chunks")

def query_knowledge(query, company="facebook"):
    """Query the vector store for relevant knowledge"""
    if company not in vector_stores:
        return "No knowledge available for this company"
    
    # Get relevant documents
    docs = vector_stores[company].similarity_search(query, k=3)
    
    # Combine document contents
    return "\\n\\n".join([doc.page_content for doc in docs])

if __name__ == "__main__":
    if len(sys.argv) > 1:
        request_id = sys.argv[1]
        request_file = f"request_{request_id}.json"
        response_file = f"response_{request_id}.json"
        
        # Read request
        with open(request_file, 'r') as f:
            request = json.load(f)
        
        command = request['command']
        params = request.get('params', {})
        
        result = ""
        
        # Execute command
        if command == "initialize":
            initialize_vector_store()
            result = "Vector store initialized"
        elif command == "query":
            result = query_knowledge(params.get('query', ''), params.get('company', 'facebook'))
        
        # Write response
        with open(response_file, 'w') as f:
            json.dump({"result": result}, f)
    else:
        # Initialize on startup
        initialize_vector_store()
        
        # Wait for commands
        while True:
            line = sys.stdin.readline().strip()
            if line == "exit":
                break
    `;
  }
}

module.exports = new KnowledgeService();