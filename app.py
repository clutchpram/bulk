"""
Kinesia Backend Server (Gemini Version)
──────────────────────────────────────
Serves kinesia.html and proxies Google Gemini API calls
so the API key stays server-side.

Requirements:
    pip install flask flask-cors google-generativeai

Usage:
    1. Set your API key:
          export GOOGLE_API_KEY=your_key_here

       OR paste directly into API_KEY below.

    2. Run:
          python server.py

    3. Open:
          http://localhost:5000
"""

import os
import google.generativeai as genai

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# ─────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────

API_KEY = os.environ.get("GOOGLE_API_KEY", "YOUR_API_KEY_HERE")
"""
Kinesia Backend Server (Gemini Version)
──────────────────────────────────────
Serves kinesia.html and proxies Google Gemini API calls
so the API key stays server-side.

Requirements:
    pip install flask flask-cors google-genai

Usage:
    1. Set your API key:
          export GOOGLE_API_KEY=your_key_here

       OR paste directly into API_KEY below.

    2. Run:
          python server.py

    3. Open:
          http://localhost:5000
"""

import os
from google import genai

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# ─────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────

API_KEY = os.environ.get("GOOGLE_API_KEY", "AQ.Ab8RN6I6kUYMmKy51LwhrndkfhS8BHyEUARQCkn_B2zpCQJCXw")

MODEL_NAME = "gemini-1.5-flash"

STATIC_DIR = os.path.dirname(os.path.abspath(__file__))

# Create Gemini client
client = genai.Client(api_key=API_KEY)

# ─────────────────────────────────────────────────────────────
# App
# ─────────────────────────────────────────────────────────────

app = Flask(__name__, static_folder=STATIC_DIR)
CORS(app)

# ─────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "kinesia.html")


@app.route("/chat", methods=["POST"])
def chat():

    # Check API key
    if not API_KEY or API_KEY == "YOUR_API_KEY_HERE":
        return jsonify({
            "error": "Google API key not configured."
        }), 500

    try:
        data = request.get_json(force=True)

        if not data or "messages" not in data:
            return jsonify({
                "error": "Invalid request — 'messages' field required."
            }), 400

        messages = data["messages"]

        # Convert chat history into Gemini format
        prompt = ""

        system_prompt = data.get("system", "")
        if system_prompt:
            prompt += f"System: {system_prompt}\n\n"

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")

            if role == "user":
                prompt += f"User: {content}\n"
            else:
                prompt += f"Assistant: {content}\n"

        # Generate response
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        # Return clean response
        return jsonify({
            "content": response.text
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


# ─────────────────────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────────────────────

@app.route("/health")
def health():

    key_set = API_KEY and API_KEY != "YOUR_API_KEY_HERE"

    return jsonify({
        "status": "ok",
        "api_key": "configured" if key_set else "missing"
    })


# ─────────────────────────────────────────────────────────────
# Entry Point
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":

    key_set = API_KEY and API_KEY != "YOUR_API_KEY_HERE"

    print("\n" + "─" * 50)
    print("  🔥 Kinesia Gemini Backend")
    print("─" * 50)
    print(f"  Static dir : {STATIC_DIR}")
    print(f"  API key    : {'✓ configured' if key_set else '✗ missing'}")
    print("  URL        : http://localhost:5000")
    print("─" * 50 + "\n")

    app.run(host="0.0.0.0", port=5000, debug=True)

MODEL_NAME = "gemini-1.5-flash"

STATIC_DIR = os.path.dirname(os.path.abspath(__file__))

# Configure Gemini
genai.configure(api_key=API_KEY)

# Create model
model = genai.GenerativeModel(MODEL_NAME)

# ─────────────────────────────────────────────────────────────
# App
# ─────────────────────────────────────────────────────────────

app = Flask(__name__, static_folder=STATIC_DIR)
CORS(app)

# ─────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "kinesia.html")


@app.route("/chat", methods=["POST"])
def chat():

    # Check API key
    if not API_KEY or API_KEY == "AQ.Ab8RN6I6kUYMmKy51LwhrndkfhS8BHyEUARQCkn_B2zpCQJCXwYl8a9n0m":
        return jsonify({
            "error": "Google API key not configured."
        }), 500

    try:
        data = request.get_json(force=True)

        if not data or "messages" not in data:
            return jsonify({
                "error": "Invalid request — 'messages' field required."
            }), 400

        messages = data["messages"]

        # Convert chat history into Gemini format
        prompt = ""

        system_prompt = data.get("system", "")
        if system_prompt:
            prompt += f"System: {system_prompt}\n\n"

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")

            if role == "user":
                prompt += f"User: {content}\n"
            else:
                prompt += f"Assistant: {content}\n"

        # Generate response
        response = model.generate_content(prompt)

        # Return clean response
        return jsonify({
            "content": response.text
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


# ─────────────────────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────────────────────

@app.route("/health")
def health():

    key_set = API_KEY and API_KEY != "YOUR_API_KEY_HERE"

    return jsonify({
        "status": "ok",
        "api_key": "configured" if key_set else "missing"
    })


# ─────────────────────────────────────────────────────────────
# Entry Point
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":

    key_set = API_KEY and API_KEY != "YOUR_API_KEY_HERE"

    print("\n" + "─" * 50)
    print("  🔥 Kinesia Gemini Backend")
    print("─" * 50)
    print(f"  Static dir : {STATIC_DIR}")
    print(f"  API key    : {'✓ configured' if key_set else '✗ missing'}")
    print("  URL        : http://localhost:5000")
    print("─" * 50 + "\n")

    app.run(host="0.0.0.0", port=5000, debug=True)