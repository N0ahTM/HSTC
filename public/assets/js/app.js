const state = {
  user: null,
  shipsCounter: 0,
};

const activitiesLabels = {
  Pilot: 'Pilot',
  PVP: 'PVP',
  PVE: 'PVE',
  FPS: 'FPS',
  Support: 'Support',
  Handel: 'Handel',
  Mining: 'Mining',
  Salvaging: 'Salvaging',
  Erkundung: 'Erkundung',
};

const selectors = {
  loginButton: document.getElementById('login-button'),
  logoutButton: document.getElementById('logout-button'),
  userSummary: document.getElementById('user-summary'),
  userAvatar: document.getElementById('user-avatar'),
  userName: document.getElementById('user-name'),
  publicNews: document.getElementById('public-news'),
  memberNews: document.getElementById('member-news'),
  fleetGrid: document.getElementById('fleet-grid'),
  eventsList: document.getElementById('events-list'),
  memberDirectory: document.getElementById('member-directory'),
  profileForm: document.getElementById('profile-form'),
  profileHint: document.getElementById('profile-login-hint'),
  shipsContainer: document.getElementById('ships-container'),
  profileFeedback: document.getElementById('profile-feedback'),
  newsAdmin: document.getElementById('news-admin'),
  newsForm: document.getElementById('news-form'),
  eventAdmin: document.getElementById('event-admin'),
  eventForm: document.getElementById('event-form'),
  discordWidget: document.getElementById('discord-widget'),
};

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat('de-CH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function updateYear() {
  const startEl = document.getElementById('game-year-start');
  const currentEl = document.getElementById('game-year-current');
  const offset = 930;
  const currentYear = new Date().getFullYear() + offset;
  if (startEl && currentEl) {
    currentEl.textContent = currentYear;
  }
}

function renderNews(container, items) {
  container.innerHTML = '';
  if (!items?.length) {
    container.innerHTML = '<p class="empty">Keine Einträge vorhanden.</p>';
    return;
  }

  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.innerHTML = `
      <h4>${item.title}</h4>
      <div class="meta">${formatDateTime(item.createdAt)} · ${item.author ?? 'HSTC Command'}</div>
      <div class="content">${item.contentHtml}</div>
    `;
    container.appendChild(card);
  });
}

function renderFleet(fleet) {
  selectors.fleetGrid.innerHTML = '';
  if (!fleet?.length) {
    selectors.fleetGrid.innerHTML = '<p class="empty">Noch keine Schiffe gemeldet.</p>';
    return;
  }

  fleet.forEach(entry => {
    const card = document.createElement('article');
    card.className = 'fleet-card';
    const tags = [];
    if (entry.focus) tags.push(entry.focus);
    if (entry.roleTag) tags.push(entry.roleTag);
    if (entry.availability) tags.push(entry.availability);
    card.innerHTML = `
      <h4>${entry.name}</h4>
      <div class="meta">von ${entry.contributor.ingameHandle || entry.contributor.username}</div>
      <div class="tag-list">${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
    `;
    selectors.fleetGrid.appendChild(card);
  });
}

function renderEvents(events) {
  selectors.eventsList.innerHTML = '';
  if (!events?.length) {
    selectors.eventsList.innerHTML = '<p class="empty">Aktuell keine Events geplant.</p>';
    return;
  }

  events.forEach(event => {
    const card = document.createElement('article');
    card.className = 'event-card';
    card.innerHTML = `
      <h4>${event.title}</h4>
      <div class="event-meta">
        <span>${formatDateTime(event.event_date)}</span>
        <span>${event.location}</span>
      </div>
      <p>${event.description}</p>
    `;
    selectors.eventsList.appendChild(card);
  });
}

function renderMembers(members) {
  selectors.memberDirectory.innerHTML = '';
  if (!members?.length) {
    selectors.memberDirectory.innerHTML = '<p class="empty">Noch keine Profile.</p>';
    return;
  }
  members.forEach(member => {
    const card = document.createElement('article');
    card.className = 'member-card';
    const activities = member.activities || [];
    card.innerHTML = `
      <h4>${member.ingameHandle || member.username}</h4>
      <div class="meta">${member.motto ?? ''}</div>
      <div class="activities">${activities.map(activity => `<span class="tag">${activitiesLabels[activity] || activity}</span>`).join('')}</div>
      <div class="ships">Schiffe für die Orga: ${member.shipCount || 0}</div>
    `;
    selectors.memberDirectory.appendChild(card);
  });
}

function addShipRow(ship = {}) {
  state.shipsCounter += 1;
  const row = document.createElement('div');
  row.className = 'ship-row';
  row.dataset.rowId = state.shipsCounter;
  row.innerHTML = `
    <div>
      <label>Schiff</label>
      <input type="text" name="ship-name" value="${ship.name || ''}" maxlength="80" placeholder="z.B. Carrack" required />
    </div>
    <div>
      <label>Fokus</label>
      <input type="text" name="ship-focus" value="${ship.focus || ''}" maxlength="60" placeholder="z.B. Erkundung" />
    </div>
    <div>
      <label>Rolle</label>
      <input type="text" name="ship-role" value="${ship.roleTag || ''}" maxlength="60" placeholder="z.B. Support" />
    </div>
    <div>
      <label>Verfügbarkeit</label>
      <input type="text" name="ship-availability" value="${ship.availability || 'Einsatzbereit'}" maxlength="30" />
    </div>
    <button type="button" class="remove-ship">Entfernen</button>
  `;
  row.querySelector('.remove-ship').addEventListener('click', () => {
    row.remove();
  });
  selectors.shipsContainer.appendChild(row);
}

function collectShipRows() {
  return Array.from(selectors.shipsContainer.querySelectorAll('.ship-row'))
    .map(row => ({
      name: row.querySelector('input[name="ship-name"]').value.trim(),
      focus: row.querySelector('input[name="ship-focus"]').value.trim(),
      roleTag: row.querySelector('input[name="ship-role"]').value.trim(),
      availability: row.querySelector('input[name="ship-availability"]').value.trim(),
    }))
    .filter(ship => ship.name.length > 0);
}

function collectActivities() {
  return Array.from(selectors.profileForm.querySelectorAll('.checkbox-grid input[type="checkbox"]:checked')).map(
    checkbox => checkbox.value
  );
}

function setActivities(activities) {
  const checkboxes = selectors.profileForm.querySelectorAll('.checkbox-grid input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = activities?.includes(checkbox.value) ?? false;
  });
}

async function fetchJson(url, options) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
    throw new Error(error.error || 'Fehler beim Laden');
  }
  return response.json();
}

async function loadSession() {
  try {
    const data = await fetchJson('/api/session');
    state.user = data.user;
    updateAuthUI();
  } catch (error) {
    console.error(error);
  }
}

function updateAuthUI() {
  if (state.user) {
    selectors.loginButton.classList.add('hidden');
    selectors.userSummary.classList.remove('hidden');
    selectors.userAvatar.src = state.user.avatar
      ? `https://cdn.discordapp.com/avatars/${state.user.discordId}/${state.user.avatar}.png?size=128`
      : 'https://hstc.space/wp-content/uploads/2025/03/HSTC-Logo.webp';
    selectors.userAvatar.alt = state.user.username;
    selectors.userName.textContent = state.user.ingameHandle || state.user.username;
    selectors.profileHint.classList.add('hidden');
    selectors.profileForm.classList.remove('hidden');
    if (state.user.isAdmin) {
      selectors.newsAdmin.classList.remove('hidden');
      selectors.eventAdmin.classList.remove('hidden');
    }
    loadProfile();
    loadMemberNews();
  } else {
    selectors.loginButton.classList.remove('hidden');
    selectors.userSummary.classList.add('hidden');
    selectors.profileHint.classList.remove('hidden');
    selectors.profileForm.classList.add('hidden');
    selectors.newsAdmin.classList.add('hidden');
    selectors.eventAdmin.classList.add('hidden');
    selectors.memberNews.innerHTML = '<p class="empty">Bitte einloggen, um interne News zu sehen.</p>';
  }
}

async function loadProfile() {
  try {
    const profile = await fetchJson('/api/profile');
    selectors.profileForm.querySelector('#profile-handle').value = profile.ingameHandle || '';
    selectors.profileForm.querySelector('#profile-motto').value = profile.motto || '';
    selectors.profileForm.querySelector('#profile-bio').value = profile.biography || '';
    setActivities(profile.activities || []);
    selectors.shipsContainer.innerHTML = '';
    if (profile.ships?.length) {
      profile.ships.forEach(ship => addShipRow(ship));
    } else {
      addShipRow();
    }
  } catch (error) {
    console.warn('Profil konnte nicht geladen werden', error);
  }
}

async function loadPublicNews() {
  try {
    const news = await fetchJson('/api/news/public');
    renderNews(selectors.publicNews, news);
  } catch (error) {
    selectors.publicNews.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

async function loadMemberNews() {
  if (!state.user) return;
  try {
    const news = await fetchJson('/api/news/members');
    renderNews(selectors.memberNews, news);
  } catch (error) {
    selectors.memberNews.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

async function loadFleet() {
  try {
    const fleet = await fetchJson('/api/fleet');
    renderFleet(fleet);
  } catch (error) {
    selectors.fleetGrid.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

async function loadEvents() {
  try {
    const events = await fetchJson('/api/events');
    renderEvents(events);
  } catch (error) {
    selectors.eventsList.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

async function loadMembers() {
  try {
    const members = await fetchJson('/api/members');
    renderMembers(members);
  } catch (error) {
    selectors.memberDirectory.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

async function loadDiscordWidget() {
  try {
    const data = await fetchJson('/api/discord/widget');
    document.getElementById('online-players').textContent = data.presence_count ?? '0';
    document.getElementById('in-voice').textContent = Array.isArray(data.members)
      ? data.members.filter(member => member.channel_id).length
      : '0';
    selectors.discordWidget.innerHTML = `
      <h4>${data.name}</h4>
      <p>Mitglieder online: ${data.presence_count ?? '0'}</p>
      <p>Channels: ${data.channels?.length ?? 0}</p>
      <a class="btn btn-outline small" href="${data.instant_invite}" target="_blank" rel="noreferrer">Direkt beitreten</a>
    `;
  } catch (error) {
    selectors.discordWidget.innerHTML = '<p class="error">Discord Widget aktuell nicht verfügbar.</p>';
    document.getElementById('online-players').textContent = 'N/A';
    document.getElementById('in-voice').textContent = 'N/A';
  }
}

function initAuthControls() {
  selectors.loginButton.addEventListener('click', () => {
    window.location.href = '/auth/discord';
  });

  selectors.logoutButton.addEventListener('click', async () => {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
    state.user = null;
    updateAuthUI();
  });
}

function initProfileForm() {
  document.getElementById('add-ship').addEventListener('click', () => addShipRow());
  selectors.profileForm.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const ships = collectShipRows();
    const payload = {
      ingameHandle: form.querySelector('#profile-handle').value.trim(),
      motto: form.querySelector('#profile-motto').value.trim(),
      biography: form.querySelector('#profile-bio').value.trim(),
      activities: collectActivities(),
      ships,
    };

    try {
      await fetchJson('/api/profile', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      selectors.profileFeedback.textContent = 'Profil gespeichert.';
      selectors.profileFeedback.style.color = '#5be7a9';
      loadFleet();
      loadMembers();
    } catch (error) {
      selectors.profileFeedback.textContent = error.message;
      selectors.profileFeedback.style.color = '#ff8a80';
    }
  });
}

function initAdminForms() {
  if (!selectors.newsForm || !selectors.eventForm) return;

  selectors.newsForm.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      title: form.querySelector('#news-title').value.trim(),
      visibility: form.querySelector('#news-visibility').value,
      contentMarkdown: form.querySelector('#news-content').value.trim(),
    };
    try {
      await fetchJson('/api/news', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      form.reset();
      loadPublicNews();
      loadMemberNews();
    } catch (error) {
      alert(error.message);
    }
  });

  selectors.eventForm.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      title: form.querySelector('#event-title').value.trim(),
      eventDate: form.querySelector('#event-date').value,
      location: form.querySelector('#event-location').value.trim(),
      description: form.querySelector('#event-description').value.trim(),
    };
    try {
      await fetchJson('/api/events', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      form.reset();
      loadEvents();
    } catch (error) {
      alert(error.message);
    }
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const href = anchor.getAttribute('href');
      if (!href || href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

async function init() {
  updateYear();
  initAuthControls();
  initProfileForm();
  initAdminForms();
  initSmoothScroll();
  addShipRow();
  await loadSession();
  await Promise.all([loadPublicNews(), loadFleet(), loadEvents(), loadMembers(), loadDiscordWidget()]);
}

document.addEventListener('DOMContentLoaded', init);
