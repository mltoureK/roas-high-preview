/* Interactive workspace preview. All actions stay on this page. */
const guided = document.getElementById('guided');
const panels = [...guided.querySelectorAll('[data-screen]')];
const progress = document.getElementById('tour-position');
const installPrompt = document.getElementById('install-prompt');
const signinPrompt = document.getElementById('signin-prompt');
let returning = true;
let current = 'workspace';

function renderStep(step, signedInPrompt = false) {
  current = step;
  document.getElementById('new-path').hidden = step !== 'workspace';
  document.getElementById('previous').hidden = returning && step === 'workspace';
  const active = panels.find(panel => panel.dataset.screen === step);
  for (const panel of panels) panel.hidden = panel !== active;
  installPrompt.hidden = signedInPrompt;
  signinPrompt.hidden = !signedInPrompt;
  const labels = { join: '1 of 3', install: '2 of 3', workspace: '3 of 3', facebook: 'Complete' };
  progress.textContent = returning && step === 'workspace' ? '' : labels[step];
  active.querySelector('h3').focus();
}

function openPath(existing) {
  returning = existing;
  renderStep(existing ? 'workspace' : 'join');
}

document.getElementById('new-path').onclick = () => openPath(false);
document.getElementById('install-app').onclick = () => {
  installPrompt.hidden = true;
  signinPrompt.hidden = false;
  signinPrompt.querySelector('button').focus();
};
for (const button of guided.querySelectorAll('[data-next]')) {
  button.onclick = () => renderStep(button.dataset.next);
}
document.getElementById('previous').onclick = () => {
  if (current === 'facebook') return renderStep('workspace');
  if (current === 'workspace') return renderStep('install', true);
  if (current === 'install') return renderStep(signinPrompt.hidden ? 'join' : 'install');
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
