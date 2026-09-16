// script.js - fetches events.json and renders a list of starred repositories

async function loadStarredList() {
  const container = document.getElementById('starred-list');
  if (!container) return;

  container.innerHTML = '<p class="empty">Loading starred repositories&hellip;</p>';

  try {
    const resp = await fetch('events.json', { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<p class="empty">No starred repositories found.</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'starred-list';

    data.forEach(item => {
      const li = document.createElement('li');
      li.className = 'starred-item';

      const info = document.createElement('div');
      info.className = 'repo-info';

      const a = document.createElement('a');
      a.className = 'repo-name';
      a.href = item.url || `https://github.com/${item.owner}/${item.repo}`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = `${item.owner}/${item.repo}`;

      const desc = document.createElement('p');
      desc.className = 'repo-desc';
      desc.textContent = item.description || '';

      info.appendChild(a);
      info.appendChild(desc);

      const meta = document.createElement('div');
      meta.className = 'meta';
      const stars = document.createElement('div');
      stars.textContent = `★ ${item.stars ?? '—'}`;
      const when = document.createElement('div');
      when.textContent = item.starred_at ? new Date(item.starred_at).toLocaleString() : '';

      meta.appendChild(stars);
      meta.appendChild(when);

      li.appendChild(info);
      li.appendChild(meta);
      ul.appendChild(li);
    });

    container.innerHTML = '';
    container.appendChild(ul);

  } catch (err) {
    console.error('Failed to load events.json', err);
    container.innerHTML = `<p class="error">Failed to load starred repositories: ${err.message}</p>`;
  }
}

window.addEventListener('DOMContentLoaded', loadStarredList);
