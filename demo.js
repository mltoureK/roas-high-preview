/* Interactive workspace preview. All actions stay on this page. */
const guided = document.getElementById('guided');
const panels = [...guided.querySelectorAll('[data-screen]')];
const progress = document.getElementById('tour-position');
let returning = true;
let current = 'workspace';

const accountPicker = document.getElementById('ad-account-picker');
const accountList = document.getElementById('workspace-accounts');
const accountActions = accountPicker.querySelector('.account-actions');
const addAccountButton = document.getElementById('manage-ad-accounts');
const campaignViews = document.querySelector('.campaign-views');
const campaignTable = document.querySelector('.account-campaigns table');
const sampleAccounts = {
  primary: { name: 'Studio North · Primary', status: 'Setup verified' },
  growth: { name: 'Studio North · Growth', status: 'Created in preview' },
  retail: { name: 'Studio North · Retail', status: 'Added in preview' }
};

function showAccountActions(open) {
  accountActions.hidden = !open;
  addAccountButton.setAttribute('aria-expanded', String(open));
}

addAccountButton.onclick = () => showAccountActions(accountActions.hidden);

const viewLabels = {
  campaigns: ['Campaigns', 'Campaign name', 'No campaigns yet'],
  adsets: ['Ad sets', 'Ad set name', 'No ad sets yet'],
  ads: ['Ads', 'Ad name', 'No ads yet']
};

function setCampaignView(view) {
  const [label, column, emptyTitle] = viewLabels[view];
  campaignTable.setAttribute('aria-label', label);
  document.getElementById('campaign-name-column').textContent = column;
  document.getElementById('campaign-empty-title').textContent = emptyTitle;
  for (const button of campaignViews.children) {
    button.setAttribute('aria-pressed', String(button.dataset.campaignView === view));
  }
}

for (const button of campaignViews.children) {
  button.onclick = () => setCampaignView(button.dataset.campaignView);
}

function selectAdAccount(key, announce = true) {
  const account = sampleAccounts[key];
  document.getElementById('selected-ad-account').textContent = account.name;
  document.getElementById('campaign-account-caption').textContent = account.name;
  const status = document.getElementById('account-state');
  status.textContent = account.status;
  status.toggleAttribute('data-verified', key === 'primary');
  for (const button of accountList.children) {
    button.setAttribute('aria-pressed', String(button.dataset.account === key));
  }
  showAccountActions(false);
  accountPicker.open = false;
  document.getElementById('account-feedback').textContent = announce ? account.name + '. ' + account.status + '.' : '';
  if (announce) accountPicker.querySelector('summary').focus();
}

function addAdAccountOption(key) {
  const option = document.createElement('button');
  option.type = 'button';
  option.dataset.account = key;
  const name = document.createElement('strong');
  name.textContent = sampleAccounts[key].name;
  const status = document.createElement('small');
  status.textContent = sampleAccounts[key].status;
  option.append(name, status);
  option.onclick = () => selectAdAccount(key);
  accountList.append(option);
}

function resetAdAccountPreview() {
  accountList.replaceChildren();
  addAdAccountOption('primary');
  for (const action of accountActions.children) action.hidden = false;
  addAccountButton.hidden = false;
  setCampaignView('campaigns');
  selectAdAccount('primary', false);
}

for (const action of accountActions.children) {
  action.onclick = () => {
    const key = action.dataset.addAccount;
    addAdAccountOption(key);
    action.hidden = true;
    addAccountButton.hidden = !accountActions.querySelector('button:not([hidden])');
    selectAdAccount(key);
  };
}
accountPicker.addEventListener('keydown', event => {
  if (event.key === 'Escape' && accountPicker.open) {
    if (accountActions.hidden) {
      accountPicker.open = false;
      accountPicker.querySelector('summary').focus();
    } else {
      showAccountActions(false);
      addAccountButton.focus();
    }
  }
});
accountPicker.addEventListener('toggle', () => {
  if (!accountPicker.open) showAccountActions(false);
});
document.addEventListener('click', event => {
  if (accountPicker.open && !accountPicker.contains(event.target)) accountPicker.open = false;
});

function renderStep(step) {
  current = step;
  document.getElementById('guide-foot').hidden = returning && step === 'workspace';
  const active = panels.find(panel => panel.dataset.screen === step);
  for (const panel of panels) panel.hidden = panel !== active;
  const labels = { inbox: '1 of 3', join: '1 of 3', verify: '2 of 3', downloadapp: 'One-time setup', appinstalled: 'One-time setup', signup: '2 of 3', signin: '2 of 3', select: '3 of 3', setup: 'One-time setup', installed: 'One-time setup', help: 'Help', 'browser-tab': 'Find your profile', folder: 'Find your profile', workspace: 'Ready to launch', 'ads-manager': '' };
  progress.textContent = returning && step === 'workspace' ? '' : labels[step];
  if (step === 'select') {
    document.getElementById('workspace-toolbar-image').src = 'assets/workspace-toolbar-closed.png';
    document.getElementById('open-workspace-menu').hidden = false;
    document.getElementById('open-workspace-menu').setAttribute('aria-expanded', 'false');
    document.getElementById('select-real-workspace').hidden = true;
    const viewport = document.querySelector('.workspace-screenshot-scroll');
    viewport.scrollLeft = viewport.scrollWidth;
  }
  if (step === 'signup') resetSignup();
  if (step === 'ads-manager') resetAdAccountPreview();
  if (step === 'signin') {
    document.getElementById('sample-login-email').textContent = 'Sample email';
    document.getElementById('sample-login-password').hidden = true;
    document.getElementById('sample-login-status').textContent = '';
    document.querySelector('.signin-continue').classList.remove('sample-ready');
    document.getElementById('try-sample-login').hidden = false;
  }
  active.querySelector('h3').focus();
}

function openPath(existing) {
  returning = existing;
  renderStep(existing ? 'workspace' : 'inbox');
}

document.getElementById('new-path').onclick = () => openPath(false);
for (const button of guided.querySelectorAll('[data-next]')) {
  button.onclick = () => renderStep(button.id === 'select-real-workspace' ? 'browser-tab' : button.dataset.next);
}
document.getElementById('previous').onclick = () => {
  if (current === 'ads-manager') return renderStep('workspace');
  if (current === 'workspace') return returning ? openPath(true) : renderStep('folder');
  if (current === 'folder') return renderStep('browser-tab');
  if (current === 'browser-tab') return renderStep('select');
  if (current === 'setup') return renderStep('select');
  if (current === 'help' || current === 'installed') return renderStep('setup');
  if (current === 'select') return renderStep('appinstalled');
  if (current === 'appinstalled') return renderStep('downloadapp');
  if (current === 'downloadapp') return renderStep('verify');
  if (current === 'verify') return renderStep('signup');
  if (current === 'signin') return renderStep('signup');
  if (current === 'signup') return renderStep('join');
  if (current === 'join') return renderStep('inbox');
  openPath(true);
};

let signupSampleFilled = false;
function resetSignup() {
  signupSampleFilled = false;
  document.getElementById('signup-password').innerHTML = 'Enter password <span aria-hidden="true">◉</span>';
  document.getElementById('signup-repeat').innerHTML = 'Enter password <span aria-hidden="true">◉</span>';
  document.getElementById('signup-terms').checked = false;
  document.getElementById('signup-create').disabled = true;
  document.getElementById('try-sample-signup').hidden = false;
  document.getElementById('signup-status').textContent = '';
}
function updateSignup() {
  const ready = signupSampleFilled && document.getElementById('signup-terms').checked;
  document.getElementById('signup-create').disabled = !ready;
  document.getElementById('signup-status').textContent = ready ? 'Click Create to preview your workspace.' : 'Tick the demo checkbox to continue.';
}
document.getElementById('try-sample-signup').onclick = () => {
  signupSampleFilled = true;
  document.getElementById('signup-password').textContent = '••••••••••••';
  document.getElementById('signup-repeat').textContent = '••••••••••••';
  document.getElementById('try-sample-signup').hidden = true;
  updateSignup();
};
document.getElementById('signup-terms').onchange = updateSignup;

function openDemoLink() {
  if (location.hash === '#campaigns') {
    returning = true;
    renderStep('ads-manager');
    guided.scrollIntoView({block: 'center'});
  } else if (location.hash === '#join' || location.hash === '#ad-accounts') {
    openPath(location.hash === '#ad-accounts');
    document.getElementById('demo').scrollIntoView();
  }
}
openDemoLink();
window.addEventListener('hashchange', openDemoLink);

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

document.getElementById('try-sample-login').onclick = () => {
  document.getElementById('sample-login-email').textContent = 'you@example.com';
  document.getElementById('sample-login-password').hidden = false;
  document.getElementById('sample-login-status').textContent = 'Sample details filled. Click Continue.';
  document.getElementById('try-sample-login').hidden = true;
  const continueButton = document.querySelector('.signin-continue');
  continueButton.classList.add('sample-ready');
  continueButton.focus({preventScroll:true});
};

const benefitRows = [...document.querySelectorAll('.buy-reasons li')];
let focusFramePending = false;
function focusNearestBenefit() {
  focusFramePending = false;
  const targetY = window.innerHeight * 0.52;
  const visibleRows = benefitRows.filter(row => {
    const bounds = row.getBoundingClientRect();
    return bounds.bottom > 70 && bounds.top < window.innerHeight;
  });
  let nearest = null;
  let distance = Infinity;
  for (const row of visibleRows) {
    const bounds = row.getBoundingClientRect();
    const nextDistance = Math.abs(bounds.top + bounds.height / 2 - targetY);
    if (nextDistance < distance) {
      nearest = row;
      distance = nextDistance;
    }
  }
  for (const row of benefitRows) row.toggleAttribute('data-focused', row === nearest);
}
function queueBenefitFocus() {
  if (focusFramePending) return;
  focusFramePending = true;
  requestAnimationFrame(focusNearestBenefit);
}
window.addEventListener('scroll', queueBenefitFocus, {passive:true});
window.addEventListener('resize', queueBenefitFocus);
focusNearestBenefit();

document.getElementById('open-workspace-menu').onclick = () => {
  document.getElementById('workspace-toolbar-image').src = 'assets/workspace-toolbar-open.png';
  document.getElementById('open-workspace-menu').setAttribute('aria-expanded', 'true');
  const target = document.getElementById('select-real-workspace');
  target.hidden = false;
  target.focus({preventScroll:true});
};

const fullAppDialog = document.getElementById('full-app-dialog');
document.getElementById('view-full-app').onclick = () => fullAppDialog.showModal();
document.getElementById('close-full-app').onclick = () => fullAppDialog.close();
fullAppDialog.addEventListener('click', event => {
  if (event.target !== fullAppDialog) return;
  const bounds = fullAppDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) fullAppDialog.close();
});
