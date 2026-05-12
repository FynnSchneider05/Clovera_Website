// Trage hier deine Workflow-URL ein:
const ENDPOINT_URL = 'https://example.com/your-webhook-here';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const form = document.getElementById('contactForm');
const errorEl = document.getElementById('formError');

function showError(message, fieldName) {
  errorEl.textContent = message;
  errorEl.classList.add('is-visible');
  if (fieldName) {
    const field = form.elements[fieldName];
    field.closest('.form-group').classList.add('has-error');
    field.focus();
  }
}

function clearErrors() {
  errorEl.textContent = '';
  errorEl.classList.remove('is-visible');
  form.querySelectorAll('.form-group.has-error').forEach(el => el.classList.remove('has-error'));
}

form.addEventListener('input', clearErrors);
form.addEventListener('change', clearErrors);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const data = Object.fromEntries(new FormData(form));
  const fields = ['name', 'email', 'company', 'subject', 'message'];

  for (const f of fields) {
    if (!data[f] || !data[f].trim()) {
      showError('Bitte alle Felder ausfüllen.', f);
      return;
    }
  }

  if (!EMAIL_REGEX.test(data.email.trim())) {
    showError('Bitte eine gültige E-Mail-Adresse eingeben.', 'email');
    return;
  }

  const btn = form.querySelector('.form-submit');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Wird gesendet …';

  const payload = { ...data, to: 'official@clovera.de', submittedAt: new Date().toISOString() };

  try {
    const res = await fetch(ENDPOINT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    btn.textContent = 'Nachricht gesendet ✓';
    btn.style.background = '#1a4f30';
    form.reset();
  } catch (err) {
    console.error('Form submit failed:', err);
    btn.disabled = false;
    btn.textContent = 'Fehler — bitte erneut versuchen';
    setTimeout(() => { btn.textContent = originalText; }, 4000);
  }
});