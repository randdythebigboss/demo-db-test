// -------------------------------------------------------
// CONFIGURATION
// Replace this URL with your deployed Cloudflare Worker URL
// after running: wrangler deploy
// -------------------------------------------------------
const API_BASE = 'https://YOUR_WORKER_SUBDOMAIN.workers.dev';
// -------------------------------------------------------

const textarea   = document.getElementById('messageInput');
const charCount  = document.getElementById('charCount');
const saveBtn    = document.getElementById('saveBtn');
const statusMsg  = document.getElementById('statusMsg');
const messageList = document.getElementById('messageList');

// Update character counter
textarea.addEventListener('input', () => {
  charCount.textContent = textarea.value.length;
});

// Save button
saveBtn.addEventListener('click', async () => {
  const text = textarea.value.trim();

  if (!text) {
    showStatus('Message cannot be empty.', 'error');
    return;
  }

  saveBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();

    if (!res.ok) {
      showStatus(data.error || 'Failed to save message.', 'error');
      return;
    }

    textarea.value = '';
    charCount.textContent = '0';
    showStatus('Message saved!', 'success');
    await loadMessages();
  } catch {
    showStatus('Network error. Is the Worker running?', 'error');
  } finally {
    saveBtn.disabled = false;
  }
});

async function loadMessages() {
  try {
    const res = await fetch(`${API_BASE}/api/messages`);
    const data = await res.json();

    if (!res.ok) {
      messageList.innerHTML = '<p class="empty">Could not load messages.</p>';
      return;
    }

    const messages = data.messages ?? [];

    if (messages.length === 0) {
      messageList.innerHTML = '<p class="empty">No messages yet.</p>';
      return;
    }

    messageList.innerHTML = messages.map(m => `
      <div class="message-item">
        <div class="message-text">${escapeHtml(m.text)}</div>
        <div class="message-date">${formatDate(m.created_at)}</div>
      </div>
    `).join('');
  } catch {
    messageList.innerHTML = '<p class="empty">Could not load messages.</p>';
  }
}

function showStatus(msg, type) {
  statusMsg.textContent = msg;
  statusMsg.className = `status ${type}`;
  clearTimeout(showStatus._timer);
  showStatus._timer = setTimeout(() => {
    statusMsg.className = 'status hidden';
  }, 4000);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString();
}

// Load messages on page load
loadMessages();
