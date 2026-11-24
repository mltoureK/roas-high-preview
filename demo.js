/* Interactive workspace preview. All actions stay on this page. */
const guided = document.getElementById('guided');
const panels = [...guided.querySelectorAll('[data-screen]')];
const progress = document.getElementById('tour-position');
let returning = true;
let current = 'workspace';

function renderStep(step) {
  current = step;
  document.getElementById('new-path').hidden = step !== 'workspace';
  document.getElementById('previous').hidden = returning && step === 'workspace';
  const active = panels.find(panel => panel.dataset.screen === step);
  for (const panel of panels) panel.hidden = panel !== active;
  const labels = { inbox: '1 of 3', join: '1 of 3', signin: '2 of 3', select: '3 of 3', setup: 'One-time setup', installed: 'One-time setup', help: 'Help', workspace: 'Ready to launch', facebook: 'Complete' };
  progress.textContent = returning && step === 'workspace' ? '' : labels[step];
  active.querySelector('h3').focus();
}

function openPath(existing) {
  returning = existing;
  renderStep(existing ? 'workspace' : 'inbox');
}

document.getElementById('new-path').onclick = () => openPath(false);
for (const button of guided.querySelectorAll('[data-next]')) {
  button.onclick = () => renderStep(button.dataset.next);
}
document.getElementById('previous').onclick = () => {
  if (current === 'facebook') return renderStep('workspace');
  if (current === 'workspace') return renderStep('setup');
  if (current === 'setup') return renderStep('select');
  if (current === 'help' || current === 'installed') return renderStep('setup');
  if (current === 'select') return renderStep('signin');
  if (current === 'signin') return renderStep('join');
  if (current === 'join') return renderStep('inbox');
  openPath(true);
};

function openLegacyLink() {
  if (location.hash !== '#join' && location.hash !== '#ad-accounts') return;
  openPath(location.hash === '#ad-accounts');
  document.getElementById('demo').scrollIntoView();
}
openLegacyLink();
window.addEventListener('hashchange', openLegacyLink);

/* Plan selection & Demo request form */
const form = document.getElementById('setup-form');
const channel = document.getElementById('channel');
const contact = document.getElementById('contact');
const planInput = document.getElementById('plan');
const planChip = document.getElementById('selected-plan');
const planChipText = document.getElementById('selected-plan-text');
const resultBox = document.getElementById('result');

document.querySelectorAll('[data-plan]').forEach((btn) => {
  btn.addEventListener('click', () => {
    planInput.value = btn.dataset.plan;
    planChipText.textContent = `Plan: ${btn.dataset.plan}`;
    planChip.hidden = false;
    document.getElementById('request').scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
    contact.focus({ preventScroll: true });
  });
});

document.getElementById('clear-plan').onclick = () => {
  planInput.value = 'Help me choose';
  planChip.hidden = true;
};

channel.addEventListener('change', () => {
  const isEmail = channel.value === 'Email';
  contact.type = isEmail ? 'email' : 'tel';
  contact.autocomplete = isEmail ? 'email' : 'tel';
  contact.placeholder = isEmail ? 'alex@yourbrand.com' : '+1 555 234 5678';
  document.getElementById('contact-label').textContent = isEmail ? 'Email address' : 'WhatsApp number';
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!contact.value.trim()) {
    contact.reportValidity();
    contact.focus();
    return;
  }
  resultBox.textContent = `Preview complete (${channel.value} · ${planInput.value}). Nothing was sent or saved.`;
  resultBox.hidden = false;
});

const spendSlider = document.getElementById('compare-spend');
const dollars = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0});
spendSlider.addEventListener('input', () => {
  const spend = spendSlider.valueAsNumber;
  document.getElementById('spend-value').value = dollars.format(spend);
  document.getElementById('percent-cost').textContent = dollars.format(spend * 0.06);
});
