from flask import Flask, jsonify, render_template, request, session
import random
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", os.urandom(32))


def generate_secret_number():
    """Generate a four-digit secret with unique digits and no leading zero."""
    first = random.choice("123456789")
    rest = random.sample([digit for digit in "0123456789" if digit != first], 3)
    return first + "".join(rest)


def calculate_cows_and_bulls(secret, guess):
    bulls = sum(secret[i] == guess[i] for i in range(4))
    cows = sum(digit in secret for digit in guess) - bulls
    return cows, bulls


@app.get("/")
def index():
    if "secret" not in session:
        session["secret"] = generate_secret_number()
        session["attempts"] = []
        session["won"] = False
    return render_template("index.html")


@app.post("/guess")
def guess():
    if "secret" not in session:
        session["secret"] = generate_secret_number()
        session["attempts"] = []
        session["won"] = False

    data = request.get_json(silent=True) or {}
    value = str(data.get("guess", "")).strip()
    if session.get("won"):
        return jsonify({"error": "You've already cracked it. Start a new game!"}), 400
    if len(value) != 4 or not value.isdigit():
        return jsonify({"error": "Enter exactly four digits."}), 400
    if value[0] == "0":
        return jsonify({"error": "Your number cannot start with zero."}), 400
    if len(set(value)) != 4:
        return jsonify({"error": "All four digits must be different."}), 400

    cows, bulls = calculate_cows_and_bulls(session["secret"], value)
    attempts = session.get("attempts", [])
    result = {"guess": value, "cows": cows, "bulls": bulls, "number": len(attempts) + 1}
    attempts.append(result)
    session["attempts"] = attempts
    won = bulls == 4
    session["won"] = won
    return jsonify({"result": result, "attempts": attempts, "won": won,
                    "secret": session["secret"] if won else None})


@app.post("/new-game")
def new_game():
    session["secret"] = generate_secret_number()
    session["attempts"] = []
    session["won"] = False
    return jsonify({"ok": True})


@app.get("/state")
def state():
    if "secret" not in session:
        session["secret"] = generate_secret_number()
        session["attempts"] = []
        session["won"] = False
    return jsonify({"attempts": session.get("attempts", []), "won": session.get("won", False),
                    "secret": session["secret"] if session.get("won") else None})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
