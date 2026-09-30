const API = 'http://localhost:3000/api/opportunities';

const FIELDS = [
  'title', 'description', 'research_area', 'faculty_name', 'department',
  'required_skills', 'positions', 'deadline', 'status',
];

const LABELS = {
  title: 'Research title',
  description: 'Research description',
  research_area: 'Research area',
  faculty_name: "Faculty member's name",
  department: 'Department',
  required_skills: 'Required skills',
  positions: 'Available positions',
  deadline: 'Application deadline',
  status: 'Status',
};

const form = document.getElementById('opportunityForm');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const listBody = document.getElementById('opportunityList');
const messageBox = document.getElementById('message');
const modal = document.getElementById('detailsModal');
const detailsBody = document.getElementById('detailsBody');

let editingId = null; // null = create mode, number = edit mode
let messageTimer = null;

/* ---------- Helpers ---------- */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => messageBox.classList.add('hidden'), 6000);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Backend ko request bhejta hai aur errors ko saaf message mein badal deta hai
async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    throw new Error('Cannot connect to the server. Please make sure the backend is running.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    let msg = (data && data.error) || `Request failed (status ${res.status})`;
    if (data && Array.isArray(data.details)) {
      msg += ': ' + data.details.join(', ');
    }
    throw new Error(msg);
  }
  return data;
}

/* ---------- Validation ---------- */

function getFormData() {
  const data = {};
  FIELDS.forEach((f) => {
    data[f] = document.getElementById(f).value.trim();
  });
  return data;
}

function validateForm(data) {
  const errors = {};

  ['title', 'description', 'research_area', 'faculty_name',
   'department', 'required_skills'].forEach((f) => {
    if (!data[f]) errors[f] = `${LABELS[f]} is required`;
  });

  if (!data.positions) {
    errors.positions = 'Available positions is required';
  } else if (!Number.isInteger(Number(data.positions)) || Number(data.positions) < 1) {
    errors.positions = 'Positions must be a whole number of at least 1';
  }

  if (!data.deadline) errors.deadline = 'Application deadline is required';

  if (data.status !== 'Open' && data.status !== 'Closed') {
    errors.status = 'Please select a status';
  }

  return errors;
}

function clearErrors() {
  document.querySelectorAll('.error').forEach((el) => (el.textContent = ''));
  FIELDS.forEach((f) => document.getElementById(f).classList.remove('invalid'));
}

function showErrors(errors) {
  Object.keys(errors).forEach((f) => {
    document.getElementById(f).classList.add('invalid');
    const span = document.querySelector(`[data-error-for="${f}"]`);
    if (span) span.textContent = errors[f];
  });
}

/* ---------- List ---------- */

async function loadOpportunities() {
  try {
    const items = await request(API);

    if (items.length === 0) {
      listBody.innerHTML =
        '<tr><td colspan="8" class="empty">No research opportunities yet. Post the first one above.</td></tr>';
      return;
    }

    listBody.innerHTML = items
      .map((o) => {
        const isOpen = o.status === 'Open';
        return `
          <tr>
            <td>${o.id}</td>
            <td>${escapeHtml(o.title)}</td>
            <td>${escapeHtml(o.faculty_name)}</td>
            <td>${escapeHtml(o.department)}</td>
            <td>${o.positions}</td>
            <td>${escapeHtml(o.deadline)}</td>
            <td><span class="badge ${isOpen ? 'badge-open' : 'badge-closed'}">${o.status}</span></td>
            <td>
              <button class="btn btn-small btn-view" data-action="view" data-id="${o.id}">View</button>
              <button class="btn btn-small btn-edit" data-action="edit" data-id="${o.id}">Edit</button>
              ${isOpen ? `<button class="btn btn-small btn-close" data-action="close" data-id="${o.id}">Close</button>` : ''}
              <button class="btn btn-small btn-delete" data-action="delete" data-id="${o.id}">Delete</button>
            </td>
          </tr>`;
      })
      .join('');
  } catch (err) {
    listBody.innerHTML =
      '<tr><td colspan="8" class="empty">Could not load opportunities.</td></tr>';
    showMessage(err.message, 'error');
  }
}

/* ---------- View details ---------- */

async function viewOpportunity(id) {
  try {
    const o = await request(`${API}/${id}`);
    const rows = [
      ['ID', o.id],
      ['Title', o.title],
      ['Description', o.description],
      ['Research Area', o.research_area],
      ['Faculty Member', o.faculty_name],
      ['Department', o.department],
      ['Required Skills', o.required_skills],
      ['Available Positions', o.positions],
      ['Application Deadline', o.deadline],
      ['Status', o.status],
      ['Posted On', o.created_at],
    ];
    detailsBody.innerHTML = rows
      .map(([label, value]) => `
        <div class="detail-row">
          <div class="detail-label">${label}</div>
          <div class="detail-value">${escapeHtml(value)}</div>
        </div>`)
      .join('');
    modal.classList.remove('hidden');
  } catch (err) {
    showMessage(err.message, 'error');
    loadOpportunities();
  }
}

function closeModal() {
  modal.classList.add('hidden');
}

/* ---------- Create / Edit ---------- */

function resetForm() {
  form.reset();
  document.getElementById('status').value = 'Open';
  clearErrors();
  editingId = null;
  formTitle.textContent = 'Post a New Research Opportunity';
  submitBtn.textContent = 'Post Opportunity';
  cancelBtn.classList.add('hidden');
}

async function startEdit(id) {
  try {
    const o = await request(`${API}/${id}`);
    FIELDS.forEach((f) => {
      document.getElementById(f).value = o[f];
    });
    clearErrors();
    editingId = id;
    formTitle.textContent = `Edit Research Opportunity #${id}`;
    submitBtn.textContent = 'Update Opportunity';
    cancelBtn.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showMessage(err.message, 'error');
    loadOpportunities();
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const data = getFormData();
  const errors = validateForm(data);
  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    showMessage('Please fix the highlighted fields.', 'error');
    return;
  }

  data.positions = Number(data.positions);
  const isEdit = editingId !== null;

  try {
    await request(isEdit ? `${API}/${editingId}` : API, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    showMessage(
      isEdit ? 'Opportunity updated successfully.' : 'Opportunity posted successfully.',
      'success'
    );
    resetForm();
    loadOpportunities();
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

cancelBtn.addEventListener('click', resetForm);

/* ---------- Close and Delete ---------- */

async function closeOpportunity(id) {
  if (!confirm('Close this opportunity? Students will no longer see it as open.')) return;
  try {
    await request(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Closed' }),
    });
    showMessage('Opportunity closed successfully.', 'success');
    loadOpportunities();
  } catch (err) {
    showMessage(err.message, 'error');
    loadOpportunities();
  }
}

async function deleteOpportunity(id) {
  if (!confirm('Delete this opportunity permanently? This cannot be undone.')) return;
  try {
    await request(`${API}/${id}`, { method: 'DELETE' });
    showMessage('Opportunity deleted successfully.', 'success');
    if (editingId === id) resetForm();
    loadOpportunities();
  } catch (err) {
    showMessage(err.message, 'error');
    loadOpportunities();
  }
}

/* ---------- Button clicks ---------- */

listBody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);

  if (btn.dataset.action === 'view') viewOpportunity(id);
  if (btn.dataset.action === 'edit') startEdit(id);
  if (btn.dataset.action === 'close') closeOpportunity(id);
  if (btn.dataset.action === 'delete') deleteOpportunity(id);
});

document.getElementById('closeModalBtn').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* ---------- Start ---------- */

loadOpportunities();