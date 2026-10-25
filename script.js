
var storageKey = 'dragonChampionsQuestsV1';
var quests = [];

function loadQuests() {
  var saved = localStorage.getItem(storageKey);
  if (saved !== null) {
    try {
      var list = JSON.parse(saved);
      if (Array.isArray(list)) return list;
    } catch (error) {
      console.log('Could not load saved quests.');
    }
  }
  return [
    { id: 'study', name: 'Study', description: 'Study for 20 minutes', xp: 100, done: false },
    { id: 'clean', name: 'Clean Up', description: 'Clean and organize your space', xp: 75, done: false },
    { id: 'water', name: 'Hydrate', description: 'Remember to drink water', xp: 50, done: false }
  ];
}







function saveQuests() {
  localStorage.setItem(storageKey, JSON.stringify(quests));
}

function getEarnedXP() {
  var total = 0;
  for (var i = 0; i < quests.length; i++) {
    if (quests[i].done) total += quests[i].xp;
  }
  return total;
}

function showQuests() {
  var list = document.getElementById('quest-list');
  if (!list) return;
  list.innerHTML = '';
  var completed = 0;

  for (var i = 0; i < quests.length; i++) {
    var quest = quests[i];
    if (quest.done) completed++;

    var card = document.createElement('div');
    card.className = 'quest-circle interactive-quest';
    var label = document.createElement('label');
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = quest.done;
    checkbox.setAttribute('aria-label', 'Complete ' + quest.name);
    checkbox.dataset.questId = quest.id;
    checkbox.addEventListener('change', changeQuest);

    var heading = document.createElement('h2');
    heading.textContent = quest.name;
    var description = document.createElement('p');
    description.textContent = quest.description;
    var points = document.createElement('strong');
    points.textContent = '+' + quest.xp + ' XP';
    label.appendChild(checkbox);
    label.appendChild(heading);
    label.appendChild(description);
    label.appendChild(points);

    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-quest';
    removeButton.textContent = 'Delete';
    removeButton.setAttribute('aria-label', 'Delete ' + quest.name);
    removeButton.dataset.questId = quest.id;
    removeButton.addEventListener('click', deleteOneQuest);
    card.appendChild(label);
    card.appendChild(removeButton);
    list.appendChild(card);
  }

  var total = getEarnedXP();
  var bonus = 0;
  if (quests.length > 0 && completed === quests.length) bonus = 250;
  var bonusText = bonus ? ' + 250 Daily Bonus!' : '';
  document.getElementById('xp-total').textContent = 'Earned XP: ' + total + bonusText + ' | Total: ' + (total + bonus);
  document.getElementById('quest-message').textContent = quests.length ? completed + ' of ' + quests.length + ' quests complete' : 'Add a quest to get started.';
}

function changeQuest(event) {
  var id = event.target.dataset.questId;
  for (var i = 0; i < quests.length; i++) {
    if (quests[i].id === id) quests[i].done = event.target.checked;
  }
  saveQuests();
  showQuests();
}

function deleteOneQuest(event) {
  var id = event.target.dataset.questId;
  for (var i = 0; i < quests.length; i++) {
    if (quests[i].id === id) {
      quests.splice(i, 1);
      break;
    }
  }
  saveQuests();
  showQuests();
}

function addQuest() {
  var nameInput = document.getElementById('quest-name');
  var xpInput = document.getElementById('quest-xp');
  var name = nameInput.value.trim();
  var xp = xpInput.value.trim() === '' ? 100 : Number(xpInput.value);
  if (!name || name.length > 60 || !Number.isInteger(xp) || xp < 1 || xp > 1000) {
    document.getElementById('quest-message').textContent = 'Enter a quest name (up to 60 characters) and XP between 1 and 1000.';
    return;
  }
  quests.push({ id: 'quest-' + Date.now() + '-' + Math.random().toString(36).slice(2), name: name, description: 'Custom daily quest', xp: xp, done: false });
  saveQuests();
  showQuests();
  document.getElementById('quest-message').textContent = 'Quest added: ' + name + '!';
  nameInput.value = '';
  xpInput.value = '100';
  nameInput.focus();
}

function deleteCheckedQuest() {
  for (var i = 0; i < quests.length; i++) {
    if (quests[i].done) {
      quests.splice(i, 1);
      saveQuests();
      showQuests();
      return;
    }
  }
  document.getElementById('quest-message').textContent = 'Check a quest first, then click Delete Quest.';
}

function chooseProfileImage(event) {
  var radio = event.target;
  var type = radio.name;
  var choice = radio.dataset.choice;
  document.getElementById(type + '-preview').src = 'images/' + type + choice + '.png';
  localStorage.setItem('dragonChampions-' + type, choice);
}

function setupProfileChoice(type) {
  var radios = document.querySelectorAll('input[name="' + type + '"]');
  var selected = Number(localStorage.getItem('dragonChampions-' + type)) || 1;
  if (selected < 1 || selected > 4) selected = 1;
  for (var i = 0; i < radios.length; i++) {
    radios[i].dataset.choice = String(i + 1);
    radios[i].checked = (i + 1 === selected);
    radios[i].addEventListener('change', chooseProfileImage);
  }
  document.getElementById(type + '-preview').src = 'images/' + type + selected + '.png';
}

function startWebsite() {
  quests = loadQuests();
  if (document.getElementById('quest-list')) {
    showQuests();
    document.querySelector('.add-button').addEventListener('click', addQuest);
    document.querySelector('.delete-button').addEventListener('click', deleteCheckedQuest);
  }
  if (document.getElementById('avatar-preview')) {
    setupProfileChoice('avatar');
    setupProfileChoice('dragon');
    var completed = 0;
    for (var i = 0; i < quests.length; i++) {
      if (quests[i].done) completed++;
    }
    document.getElementById('quest-completed').textContent = completed;
    document.getElementById('champion-level').textContent = 'Level ' + (Math.floor(getEarnedXP() / 500) + 1);
  }
}

startWebsite();
