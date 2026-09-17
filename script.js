// script.js - fetches events.json and renders a list of starred repositories

// Original error line:
// container.innerHTML = '<p class="empty">Loading starred repositories&hellip;</p>';
// Reason: using innerHTML for dynamic status is less safe and not as robust for assistive tech updates.

// Original error line:
// container.innerHTML = '<p class="empty">No starred repositories found.</p>';
// Reason: rendered message is not announced consistently and a DOM-based status pattern is more accessible.

// Original error line:
// a.href = item.url || `https://github.com/${item.owner}/${item.repo}`;
// Reason: invalid owner/repo values can produce broken links and the URL should be validated.

// Original error line:
// when.textContent = item.starred_at ? new Date(item.starred_at).toLocaleString() : '';
// Reason: malformed dates can produce "Invalid Date" and should be validated before display.

// Original error line:
// container.innerHTML = `<p class="error">Failed to load starred repositories: ${err.message}</p>`;
// Reason: dynamic error messages should be created with DOM APIs and announced with an alert role.

function renderStatus(message, tone = 'info') {
  const container = document.getElementById('starred-list');
  if (!container) return;

  container.textContent = '';
  container.setAttribute('role', tone === 'error' ? 'alert' : 'status');

  const status = document.createElement('p');
  status.className = tone === 'error' ? 'error' : 'empty';
  status.textContent = message;
  container.appendChild(status);
}

function normalizeRepositoryUrl(item) {
  if (typeof item?.url === 'string' && item.url.trim()) {
    try {
      const url = new URL(item.url);
      return url.toString();
    } catch {
      // Invalid URL; fall through to a constructed GitHub URL if possible.
    }
  }

  const owner = typeof item?.owner === 'string' ? item.owner.trim() : '';
  const repo = typeof item?.repo === 'string' ? item.repo.trim() : '';

  if (owner && repo) {
    return `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  }

  return null;
}

function formatStars(value) {
  const stars = Number(value);
  return Number.isFinite(stars) && stars >= 0 ? stars.toLocaleString() : '—';
}

function formatStarredDate(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return 'Unknown date';
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return 'Unknown date';
  }

  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

function buildRepoList(items) {
  const list = document.createElement('ul');
  list.className = 'starred-list';

  items.forEach((item) => {
    if (!item || typeof item !== 'object') return;

    const owner = typeof item.owner === 'string' ? item.owner.trim() : '';
    const repo = typeof item.repo === 'string' ? item.repo.trim() : '';
    const name = owner && repo
      ? `${owner}/${repo}`
      : (typeof item.name === 'string' && item.name.trim()
        ? item.name.trim()
        : 'Unnamed repository');
    const description = typeof item.description === 'string' && item.description.trim()
      ? item.description.trim()
      : 'No description available.';

    const li = document.createElement('li');
    li.className = 'starred-item';

    const info = document.createElement('div');
    info.className = 'repo-info';

    const repoUrl = normalizeRepositoryUrl(item);
    const repoLink = document.createElement(repoUrl ? 'a' : 'span');
    repoLink.className = 'repo-name';
    repoLink.textContent = name;

    if (repoUrl) {
      repoLink.href = repoUrl;
      repoLink.target = '_blank';
      repoLink.rel = 'noopener noreferrer';
    }

    const desc = document.createElement('p');
    desc.className = 'repo-desc';
    desc.textContent = description;

    info.append(repoLink, desc);

    const meta = document.createElement('div');
    meta.className = 'meta';

    const stars = document.createElement('div');
    stars.className = 'star-count';
    stars.textContent = `★ ${formatStars(item.stars)}`;

    const date = document.createElement('div');
    date.className = 'starred-date';
    date.textContent = formatStarredDate(item.starred_at);

    meta.append(stars, date);
    li.append(info, meta);
    list.appendChild(li);
  });

  return list;
}

async function loadStarredList() {
  const container = document.getElementById('starred-list');
  if (!container) return;

  renderStatus('Loading starred repositories…');

  try {
    const response = await fetch('events.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Starred data is not a JSON array.');
    }

    if (data.length === 0) {
      renderStatus('No starred repositories found.');
      return;
    }

    container.textContent = '';
    container.setAttribute('role', 'status');
    container.appendChild(buildRepoList(data));
  } catch (error) {
    console.error('Failed to load events.json', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    renderStatus(`Failed to load starred repositories: ${message}`, 'error');
  }
}

window.addEventListener('DOMContentLoaded', loadStarredList);
