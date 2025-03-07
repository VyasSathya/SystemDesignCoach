from flask import Flask, jsonify, request
from flask_cors import CORS
import config

app = Flask(__name__)
# Allow all origins and explicitly allow OPTIONS
CORS(app, resources={r"/api/*": {"origins": "*"}}, methods=["GET", "POST", "OPTIONS"])

@app.route('/api/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "port": config.PORT,
        "database_connected": False
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    # Dummy login logic; in a real app, validate credentials
    return jsonify({
        "token": "dummy_token",
        "user": {
            "id": 1,
            "name": "Test User",
            "email": data.get("email", "test@example.com")
        }
    })

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    return jsonify({
        "user": {
            "id": 1,
            "name": "Test User",
            "email": "test@example.com"
        }
    })

@app.route('/api/coaching/problems', methods=['GET'])
def coaching_problems():
    return jsonify({
        "problems": [
            {"id": 1, "title": "Coaching Problem 1", "description": "Example coaching problem."},
            {"id": 2, "title": "Coaching Problem 2", "description": "Another example problem."}
        ]
    })

@app.route('/api/coaching/start/<problemId>', methods=['POST'])
def start_coaching_session(problemId):
    return jsonify({
        "session": {
            "_id": 123,
            "problemId": problemId,
            "status": "started"
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=config.PORT, debug=True)
