const API_URL = "http://192.168.8.102:3000";

async function initPage() {
  const jwtToken = localStorage.getItem('jwtToken');
  if (!jwtToken) {
    window.location.href = './login.html';
    return;
  }
  await loadGroups();
  setupUsername();
}

async function loadGroups() {
  const container = document.getElementById("groupContainer");
  container.innerHTML = "";

  try {
    const jwtToken = localStorage.getItem('jwtToken');
    const response = await fetch(`${API_URL}/api/parties`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    if (!response.ok) throw new Error("Failed to load groups.");

    const data = await response.json();
    const groups = data.parties || [];
    groups.forEach(group => {
      const code = group._id;
      const link = `group_table.html?code=${encodeURIComponent(code)}`;
      const card = createGroupCard(group.name, group.description, link);
      container.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading groups:", error);
  }
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
  if (document.getElementById('newGroupFormOverlay')) return;

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

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name = form.groupName.value.trim();
    const description = form.groupDescription.value.trim();

    if (name && description) {
      try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await fetch(`${API_URL}/api/parties`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
          },
          body: JSON.stringify({ name, description })
        });

        if (!response.ok) {
          alert('Failed to save new group. Please try again.');
          return;
        }

        await response.json();

        await loadGroups();

        document.body.removeChild(overlay);

      } catch (error) {
        alert('Error occurred while saving group.');
        console.error(error);
      }
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

    async function saveUsername() {
      const newName = input.value.trim();
      if (newName) {
        const res = await fetch(`${API_URL}/api/users`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          },
          body: JSON.stringify({ nickname: newName })
        });
        if (!res.ok) {
          alert('Failed to update username. Please try again.');
          input.replaceWith(usernameDisplay);
          usernameDisplay.textContent = username;
          return;
        }
        const data = await res.json();
        username = newName;
        localStorage.setItem('username', username);
        localStorage.setItem('jwtToken', data.token || localStorage.getItem('jwtToken'));
        localStorage.setItem("user", JSON.stringify(data.user) || localStorage.getItem("user"));
      }
      input.replaceWith(usernameDisplay);
      usernameDisplay.textContent = username;
    }

    input.addEventListener('blur', saveUsername);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        input.blur();
      }
    });
  });
}

function openAccessCodeModal() {
  if (document.getElementById('accessCodeModalOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'accessCodeModalOverlay';
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'group-form';

  modal.innerHTML = `
    <label for="accessCodeInput">Enter Access Code (Link):</label>
    <input type="text" id="accessCodeInput" placeholder="Enter code or link" />
    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
      <button id="cancelAccessCodeBtn" class="cancel-btn">Cancel</button>
      <button id="submitAccessCodeBtn" class="save-btn">Submit</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  document.getElementById('cancelAccessCodeBtn').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  document.getElementById('submitAccessCodeBtn').addEventListener('click', async () => {
    const codeInput = document.getElementById('accessCodeInput').value.trim();
    if (!codeInput) {
      alert('Please enter an access code or link.');
      return;
    }

    try {
      await addGroupByAccessCode(codeInput);
      document.body.removeChild(overlay);
    } catch (error) {
      alert('Failed to save access code. Please try again.');
      console.error(error);
    }
  });
}

async function addGroupByAccessCode(code) {
  const jwtToken = localStorage.getItem('jwtToken');
  if (!jwtToken) {
    alert('User not authenticated');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/parties/join/${code}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server error: ${errText}`);
    }

    const data = await response.json();
    const party = data.party;
    if (!party) {
      throw new Error('No party data returned from server');
    }

    const container = document.getElementById('groupContainer');
    const name = party.name || 'Unnamed Group';
    const description = party.description || '';
    const link = `group.html?code=${encodeURIComponent(party._id || party.id || '')}`;

    const card = createGroupCard(name, description, link);
    container.appendChild(card);

  } catch (error) {
    alert(`Failed to join group: ${error.message}`);
    console.error(error);
  }
}
