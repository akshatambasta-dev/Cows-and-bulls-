const form = document.querySelector('#guess-form');
const input = document.querySelector('#guess-input');
const button = document.querySelector('#guess-button');
const feedback = document.querySelector('#feedback');
const history = document.querySelector('#history');
const count = document.querySelector('#attempt-count');
const total = document.querySelector('#history-total');
const slots = [...document.querySelectorAll('.code-slot')];
const winBanner = document.querySelector('#win-banner');

function setFeedback(message, type = '') {
  feedback.textContent = message;
  feedback.className = `feedback ${type}`.trim();
}

function renderState(state) {
  const attempts = state.attempts || [];
  count.textContent = String(attempts.length).padStart(2, '0');
  total.textContent = `${attempts.length} ${attempts.length === 1 ? 'ENTRY' : 'ENTRIES'}`;
  history.replaceChildren();
  if (!attempts.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-history';
    const icon = document.createElement('span'); icon.className = 'empty-icon'; icon.textContent = '⌁';
    const text = document.createElement('span'); text.textContent = 'Your attempts will appear here.';
    empty.append(icon, text); history.append(empty);
  } else {
    attempts.slice().reverse().forEach((attempt) => {
      const row = document.createElement('div'); row.className = 'history-row';
      const fields = [
        ['num', String(attempt.number).padStart(2, '0')],
        ['number', attempt.guess],
        ['score cows', String(attempt.cows)],
        ['score bulls', String(attempt.bulls)]
      ];
      fields.forEach(([className, value]) => { const cell = document.createElement('span'); cell.className = className; cell.textContent = value; row.append(cell); });
      history.append(row);
    });
  }
  slots.forEach((slot, i) => { slot.textContent = state.won && state.secret ? state.secret[i] : '?'; slot.style.color = state.won ? 'var(--lime)' : ''; slot.style.borderColor = state.won ? '#c9f36a70' : ''; });
  winBanner.hidden = !state.won;
  if (state.won) {
    document.querySelector('#secret-reveal').textContent = state.secret;
    document.querySelector('#win-attempts').textContent = attempts.length;
    input.disabled = true; button.disabled = true;
    setFeedback('Beautifully done. You cracked the code!', 'success');
  } else {
    input.disabled = false; button.disabled = false;
  }
}

async function loadState() {
  try { const response = await fetch('/state'); renderState(await response.json()); }
  catch { setFeedback('Could not connect to the game. Refresh and try again.', 'error'); }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const guess = input.value.trim();
  if (!/^\d{4}$/.test(guess)) return setFeedback('Enter exactly four digits.', 'error');
  if (guess[0] === '0') return setFeedback('Your number cannot start with zero.', 'error');
  if (new Set(guess).size !== 4) return setFeedback('All four digits must be different.', 'error');
  button.disabled = true;
  try {
    const response = await fetch('/guess', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({guess}) });
    const data = await response.json();
    if (!response.ok) { setFeedback(data.error || 'That guess could not be submitted.', 'error'); return; }
    renderState(data);
    if (data.won) setFeedback(`The code is ${data.secret}. Excellent deduction!`, 'success');
    else setFeedback(`${data.result.bulls} bull${data.result.bulls === 1 ? '' : 's'} · ${data.result.cows} cow${data.result.cows === 1 ? '' : 's'}. Keep going.`);
    input.value = '';
    if (!data.won) input.focus();
  } catch { setFeedback('Connection issue — please try that guess again.', 'error'); }
  finally { if (!document.querySelector('#win-banner').hidden) button.disabled = true; else button.disabled = false; }
});

input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(0, 4); });
document.querySelector('#new-game').addEventListener('click', async () => {
  try {
    const response = await fetch('/new-game', {method:'POST'});
    if (!response.ok) throw new Error('Could not start a new game');
    renderState({attempts:[], won:false, secret:null}); input.value = ''; input.focus(); setFeedback('New code generated. Make your first guess.');
  } catch { setFeedback('Could not start a new game. Refresh and retry.', 'error'); }
});
loadState();
