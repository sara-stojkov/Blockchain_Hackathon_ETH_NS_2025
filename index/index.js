const groups = [
  {
    name: "Group Alpha",
    description: "Handles research funding distributions.",
    link: "group_alpha.html"
  },
  {
    name: "Group Beta",
    description: "Manages citation validation and ETH payouts.",
    link: "group_beta.html"
  }
];

function initPage() {
  loadGroups();
  setupUsername();
}

function loadGroups() {
  const container = document.getElementById("groupContainer");
  container.innerHTML = "";

  groups.forEach(group => {
    const card = createGroupCard(group.name, group.description, group.link);
    container.appendChild(card);
  });
}

function createGroupCard(name, description, link) {
  const card = document.createElement("div");
  card.className = "group-card";

  card.innerHTML = `
    <h2>${name}</h2>
    <p>${description}</p>
    <a href="${link}" class="group-button">Enter Group</a>
  `;

  return card;
}

function addNewGroup() {
  if(document.getElementById('newGroupFormOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'newGroupFormOverlay';
  overlay.className = 'modal-overlay';

  const form = document.createElement('form');
  form.className = 'group-form';

  form.innerHTML = `
    <label for="groupName">Group Name:</label>
    <input type="text" id="groupName" name="groupName" required />

    <label for="groupDescription">Description:</label>
    <textarea id="groupDescription" name="groupDescription" required></textarea>

    <label for="groupLink">Link (e.g. group_xyz.html):</label>
    <input type="text" id="groupLink" name="groupLink" required />

    <div class="group-form-buttons">
      <button type="button" class="cancel-btn">Cancel</button>
      <button type="submit" class="save-btn">Save</button>
    </div>
  `;

  overlay.appendChild(form);
  document.body.appendChild(overlay);

  form.querySelector('.cancel-btn').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name = form.groupName.value.trim();
    const description = form.groupDescription.value.trim();
    const link = form.groupLink.value.trim();

    if(name && description && link) {
      groups.push({ name, description, link });

      const container = document.getElementById('groupContainer');
      const newCard = createGroupCard(name, description, link);
      container.appendChild(newCard);

      document.body.removeChild(overlay);
    } else {
      alert('Please fill in all fields!');
    }
  });
}

function setupUsername() {
  const usernameDisplay = document.getElementById('usernameDisplay');

  let username = localStorage.getItem('username') || 'Guest User';

  usernameDisplay.textContent = username;

  usernameDisplay.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'usernameInput';
    input.value = username;
    input.maxLength = 20;

    usernameDisplay.replaceWith(input);
    input.focus();

    function saveUsername() {
      const newName = input.value.trim();
      if(newName) {
        localStorage.setItem('username', newName);
        username = newName;
      }
      input.replaceWith(usernameDisplay);
      usernameDisplay.textContent = username;
    }

    input.addEventListener('blur', saveUsername);
    input.addEventListener('keydown', e => {
      if(e.key === 'Enter') {
        input.blur();
      }
    });
  });
}
