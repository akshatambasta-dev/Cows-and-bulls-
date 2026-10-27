# Cows & Bulls

A responsive web version of the classic Cows and Bulls number game, built with Flask, HTML, CSS and JavaScript.

## Rules
- Guess the hidden four-digit number.
- Digits are unique and the number cannot start with zero.
- A **bull** is a correct digit in the correct position.
- A **cow** is a correct digit in the wrong position.
- Four bulls wins the game.

## Run locally

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Then open http://127.0.0.1:5000.

## Deploy on Render
The repository includes `render.yaml` for a free Render web service. Connect the repository in Render or create the service from the Blueprint. The app listens on Render's `$PORT` and auto-deploys when `main` changes.

Each browser session gets its own secret number and guess history.
