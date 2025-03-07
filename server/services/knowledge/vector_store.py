import sys
import os
import json
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
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
    try:
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
    except Exception as e:
        print(f"Error initializing vector store: {str(e)}")
        return f"Error: {str(e)}"
    
    return "Vector store initialized successfully"

def query_knowledge(query, company="facebook"):
    """Query the vector store for relevant knowledge"""
    try:
        if company not in vector_stores:
            return "No knowledge available for this company"
        
        # Get relevant documents
        docs = vector_stores[company].similarity_search(query, k=3)
        
        # Combine document contents
        return "\n\n".join([doc.page_content for doc in docs])
    except Exception as e:
        print(f"Error querying knowledge: {str(e)}")
        return f"Error: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        request_id = sys.argv[1]
        request_file = f"request_{request_id}.json"
        response_file = f"response_{request_id}.json"
        
        try:
            # Check if request file exists
            if not os.path.exists(request_file):
                result = f"Error: Request file {request_file} not found"
                with open(response_file, 'w') as f:
                    json.dump({"result": result}, f)
                sys.exit(1)
            
            # Read request
            with open(request_file, 'r') as f:
                request = json.load(f)
            
            command = request.get('command', '')
            params = request.get('params', {})
            
            result = ""
            
            # Execute command
            if command == "initialize":
                result = initialize_vector_store()
            elif command == "query":
                result = query_knowledge(params.get('query', ''), params.get('company', 'facebook'))
            else:
                result = f"Unknown command: {command}"
            
            # Write response
            with open(response_file, 'w') as f:
                json.dump({"result": result}, f)
                
        except Exception as e:
            # Ensure we write a response file even if an error occurs
            error_message = f"Error processing request: {str(e)}"
            print(error_message)
            try:
                with open(response_file, 'w') as f:
                    json.dump({"result": error_message}, f)
            except:
                print(f"Could not write to response file {response_file}")
    else:
        # Initialize on startup
        print("Initializing vector store...")
        initialize_vector_store()
        
        # Wait for commands
        print("Ready for commands (type 'exit' to quit)")
        while True:
            try:
                line = sys.stdin.readline().strip()
                if line == "exit":
                    break
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"Error reading input: {str(e)}")