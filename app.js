// Point this at your backend. In production, set window.API_BASE via an env var
// injected at build time (Amplify environment variables → window.API_BASE).
const API_BASE = window.API_BASE || 'http://localhost:3001/api';

const statusEl = document.getElementById('status');
const listEl = document.getElementById('notes-list');
const form = document.getElementById('note-form');

function showStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.className = 'status' + (isError ? ' error' : '');
}

async function fetchNotes() {
  try {
    const res = await fetch(`${API_BASE}/notes`);
    const notes = await res.json();
    listEl.innerHTML = '';
    notes.forEach(note => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="note-content">
          <div class="note-title">${escHtml(note.title)}</div>
          ${note.body ? `<div class="note-body">${escHtml(note.body)}</div>` : ''}
          <div class="note-date">${new Date(note.created_at).toLocaleString()}</div>
        </div>
        <button class="delete-btn" data-id="${note.id}">Delete</button>
      `;
      listEl.appendChild(li);
    });
    showStatus(`${notes.length} note(s) loaded`);
  } catch (e) {
    showStatus('Could not reach backend — is it running?', true);
  }
}

listEl.addEventListener('click', async e => {
  if (!e.target.matches('.delete-btn')) return;
  const id = e.target.dataset.id;
  await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
  fetchNotes();
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const body = document.getElementById('body').value.trim();
  try {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body }),
    });
    if (!res.ok) throw new Error();
    form.reset();
    fetchNotes();
  } catch {
    showStatus('Failed to save note', true);
  }
});

function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

fetchNotes();
