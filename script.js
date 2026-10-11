// Dragon Champions: browser-only quest and profile interactions.
const starterQuests = [
  { id: 'study', name: 'Study', description: 'Study for 20 minutes', xp: 100, done: false },
  { id: 'clean', name: 'Clean Up', description: 'Clean and organize your space', xp: 75, done: false },
  { id: 'water', name: 'Hydrate', description: 'Remember to drink water', xp: 50, done: false }
];
const storageKey = 'dragonChampionsQuestsV1';
function loadQuests() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved)) return saved;
  } catch (error) { console.warn('Could not load saved quests', error); }
  return starterQuests.map(quest => ({ ...quest }));
}
function saveQuests(quests) { localStorage.setItem(storageKey, JSON.stringify(quests)); }
function earnedXP(quests) { return quests.filter(q => q.done).reduce((sum, q) => sum + q.xp, 0); }
function renderQuests(quests) {
  const list = document.querySelector('#quest-list');
  if (!list) return;
  list.replaceChildren();
  quests.forEach(quest => {
    const card = document.createElement('div');
    card.className = 'quest-circle interactive-quest';
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox'; checkbox.checked = quest.done;
    checkbox.setAttribute('aria-label', 'Complete ' + quest.name);
    checkbox.addEventListener('change', () => { quest.done = checkbox.checked; saveQuests(quests); renderQuests(quests); });
    const heading = document.createElement('h2'); heading.textContent = quest.name;
    const description = document.createElement('p'); description.textContent = quest.description;
    const points = document.createElement('strong'); points.textContent = '+' + quest.xp + ' XP';
    label.append(checkbox, heading, description, points);
    const remove = document.createElement('button'); remove.type = 'button';
    remove.className = 'remove-quest'; remove.textContent = 'Delete';
    remove.setAttribute('aria-label', 'Delete ' + quest.name);
    remove.addEventListener('click', () => { const i = quests.findIndex(q => q.id === quest.id); if (i !== -1) quests.splice(i, 1); saveQuests(quests); renderQuests(quests); });
    card.append(label, remove); list.append(card);
  });
  const total = earnedXP(quests);
  const allDone = quests.length > 0 && quests.every(q => q.done);
  document.querySelector('#xp-total').textContent = 'Earned XP: ' + total + (allDone ? ' + 250 Daily Bonus!' : '') + ' | Total: ' + (total + (allDone ? 250 : 0));
  const message = document.querySelector('#quest-message');
  message.textContent = quests.length ? quests.filter(q => q.done).length + ' of ' + quests.length + ' quests complete' : 'Add a quest to get started.';
}
function initQuests() {
  if (!document.querySelector('#quest-list')) return;
  const quests = loadQuests(); renderQuests(quests);
  const name = document.querySelector('#quest-name');
  const xp = document.querySelector('#quest-xp');
  document.querySelector('.add-button').addEventListener('click', () => {
    const title = name.value.trim();
    // Use 100 XP when the number field is left blank.
    const points = xp.value.trim() === '' ? 100 : Number(xp.value);
    if (!title || title.length > 60 || !Number.isInteger(points) || points < 1 || points > 1000) {
      document.querySelector('#quest-message').textContent = 'Enter a quest name (up to 60 characters) and XP between 1 and 1000.'; return;
    }
    quests.push({ id: 'quest-' + Date.now() + '-' + Math.random().toString(36).slice(2), name: title, description: 'Custom daily quest', xp: points, done: false });
    saveQuests(quests); renderQuests(quests);
    document.querySelector('#quest-message').textContent = 'Quest added: ' + title + '!';
    name.value = ''; xp.value = '100'; name.focus();
  });
  document.querySelector('.delete-button').addEventListener('click', () => {
    const index = quests.findIndex(q => q.done);
    if (index < 0) { document.querySelector('#quest-message').textContent = 'Check a quest first, then click Delete Quest.'; return; }
    quests.splice(index, 1); saveQuests(quests); renderQuests(quests);
  });
}
function initProfile() {
  if (!document.querySelector('#avatar-preview')) return;
  for (const type of ['avatar', 'dragon']) {
    const options = [...document.querySelectorAll('input[name="' + type + '"]')];
    const saved = Number(localStorage.getItem('dragonChampions-' + type) || 1);
    const selected = saved >= 1 && saved <= 4 ? saved : 1;
    options.forEach((radio, index) => {
      radio.checked = index + 1 === selected;
      radio.addEventListener('change', () => {
        if (!radio.checked) return;
        const choice = index + 1;
        document.querySelector('#' + type + '-preview').src = 'images/' + type + choice + '.png';
        localStorage.setItem('dragonChampions-' + type, String(choice));
      });
    });
    document.querySelector('#' + type + '-preview').src = 'images/' + type + selected + '.png';
  }
  const quests = loadQuests();
  const completed = quests.filter(q => q.done).length;
  document.querySelector('#quest-completed').textContent = String(completed);
  document.querySelector('#champion-level').textContent = 'Level ' + (Math.floor(earnedXP(quests) / 500) + 1);
}
initQuests(); initProfile();
