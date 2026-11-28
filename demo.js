/* Interactive workspace preview. All actions stay on this page. */
const guided = document.getElementById('guided');
const panels = [...guided.querySelectorAll('[data-screen]')];

const stepHints = {
  'page-settings': 'Choose a Page setup path to see the steps and who completes them.',
  'account-overview': 'Page and phone are confirmed in this demo. Next, add a payment method.',
  'payment-location': 'Review the example billing settings, then tap Next.',
  'payment-methods': 'Choose a sample payment method to see what comes next.',
  inbox: 'Open the invitation email. It contains your link to the shared workspace.',
  join: 'Tap Join to connect your Multilogin account to the invited workspace.',
  signup: 'Fill the sample password, check the demo terms, then Create. Your account identifies you when you sign in.',
  verify: 'Preview email verification. In the real setup, this confirms you control the invited email address.',
  downloadapp: 'Choose your computer’s operating system. The desktop app runs your prepared browser profile.',
  appinstalled: 'Continue with the sample login. Signing in makes your shared workspaces available in the desktop app.',
  signin: 'Try the sample login, then Continue. Your existing account can access the workspace you joined.',
  select: 'Open the account menu and choose ROAS HIGH. This switches you into the workspace we prepared.',
  setup: 'Next, preview the desktop download or open your installed profile.',
  installed: 'Next, preview the prepared profile.',
  help: 'Next, return to setup when you are ready.',
  'browser-tab': 'Choose Browser to find the desktop profiles assigned to you.',
  folder: 'Open Studio North. Folders group the profiles for your business.',
  workspace: 'Press Play to launch your prepared browser profile and reach the sample Ads Manager.',
  'ads-manager': 'Your workspace is open. Explore the ad account menu, or go back to replay.'
};
for (const panel of panels) {
  const hint = document.createElement('p');
  hint.className = 'demo-next-hint';
  hint.textContent = stepHints[panel.dataset.screen] || 'Choose an action below to continue.';
  panel.prepend(hint);
}

const invitationArrow = document.querySelector('.play-guide-arrow');
const invitationActions = guided.querySelectorAll('#new-path, .email-join-button, #try-sample-signup, .signup-create, .verification-preview button, .download-os-choices button, .desktop-login-continue, #try-sample-login');
for (const action of invitationActions) {
  const arrow = invitationArrow.cloneNode(true);
  arrow.setAttribute('class', 'invitation-action-arrow');
  action.prepend(arrow);
  action.classList.add('invitation-guided-action');
}

const progress = document.getElementById('tour-position');
let returning = true;
let current = 'workspace';

const accountPicker = document.getElementById('ad-account-picker');
const accountList = document.getElementById('workspace-accounts');
const accountActions = accountPicker.querySelector('.account-actions');
const addAccountButton = document.getElementById('manage-ad-accounts');
const sampleAccounts = {
  primary: { name: 'Studio North · Primary', status: 'Prepared account' },
  growth: { name: 'Studio North · Growth', status: 'Created in preview' },
  retail: { name: 'Studio North · Retail', status: 'Added in preview' }
};

let accountChosen = false;
function updateAccountGuidance() {
  const hint = guided.querySelector('[data-screen="ads-manager"] .demo-next-hint');
  hint.textContent = accountPicker.open ? 'Select Studio North · Primary from the account list.' : accountChosen ? 'Account selected. Next, open Account Overview below.' : 'Open the account dropdown to choose your account.';
  accountPicker.classList.toggle('selection-complete', accountChosen);
}

function showAccountActions(open) {
  accountActions.hidden = !open;
  addAccountButton.setAttribute('aria-expanded', String(open));
}

addAccountButton.onclick = () => showAccountActions(accountActions.hidden);

function selectAdAccount(key, announce = true) {
  const account = sampleAccounts[key];
  document.getElementById('selected-ad-account').textContent = account.name;
  const status = document.getElementById('account-state');
  status.textContent = account.status;
  status.toggleAttribute('data-verified', key === 'primary');
  for (const button of accountList.children) {
    button.setAttribute('aria-pressed', String(button.dataset.account === key));
  }
  showAccountActions(false);
  accountPicker.open = false;
  document.getElementById('account-feedback').textContent = announce ? account.name + '. ' + account.status + '.' : '';
  if (announce) { accountChosen = true; updateAccountGuidance(); accountPicker.querySelector('summary').focus(); }
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
  const count = accountList.childElementCount;
  document.getElementById('portfolio-count').textContent = count + (count === 1 ? ' ad account' : ' ad accounts');
}

function resetAdAccountPreview() {
  accountChosen = false;
  accountList.replaceChildren();
  addAdAccountOption('primary');
  for (const action of accountActions.children) action.hidden = false;
  addAccountButton.hidden = false;
  selectAdAccount('primary', false);
  updateAccountGuidance();
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
  updateAccountGuidance();
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
  const labels = { inbox: '1 of 3', join: '1 of 3', verify: '2 of 3', downloadapp: 'One-time setup', appinstalled: 'One-time setup', signup: '2 of 3', signin: '2 of 3', select: '3 of 3', setup: 'One-time setup', installed: 'One-time setup', help: 'Help', 'browser-tab': 'Find your profile', folder: 'Find your profile', workspace: 'Ready to launch', 'payment-location': 'Payment setup · 1 of 2', 'payment-methods': 'Payment setup · 2 of 2', 'page-settings': 'Page setup', 'account-overview': 'Account setup', 'ads-manager': '' };
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
  if (current === 'payment-methods') return renderStep('payment-location');
  if (current === 'payment-location') return renderStep('account-overview');
  if (current === 'page-settings') return renderStep('account-overview');
  if (current === 'account-overview') return renderStep('ads-manager');
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


const paymentGuidance = {
  'Debit or credit card': 'Have your cardholder name, card number, expiry date, security code and billing address ready. If your card or its linked account has a payment restriction, check the issue with the issuer or Meta before connecting it. For a dedicated advertising card, we recommend considering Adpos, which provides virtual cards for ad payments. Review its eligibility, fees and funding terms before signing up.',
  'PayPal': 'Connect PayPal, then choose how to fund your ads. An eligible bank account or card linked in your PayPal Wallet can supply the money. Check the funding source and payment permission before approving the connection. Tip: link and verify your preferred bank in PayPal first.',
  'Online banking': 'Pay from your bank through the banking option offered in Meta. Choose your supported bank and follow the connection or verification steps shown. Availability and processing times depend on your account and region. Tip: check the bank name, debit authorization and timing before confirming.',
  'Stablecoin (USDC)': 'Got USDC? When this option appears in your account, follow Meta’s payment partner to top up your ad balance. The partner converts the payment and Meta credits the balance. Availability varies by account and region. Tip: match the USDC network, destination and amount shown by the provider, and review the fees before sending.'
};
for (const choice of document.querySelectorAll('[data-payment-choice]')) {
  choice.addEventListener('click', () => {
    for (const option of document.querySelectorAll('[data-payment-choice]')) option.setAttribute('aria-pressed', String(option === choice));
    const info = document.getElementById('payment-demo-status');
    info.replaceChildren();
    const heading = document.createElement('strong');
    heading.textContent = choice.dataset.paymentChoice;
    const guidance = document.createElement('p');
    guidance.textContent = paymentGuidance[choice.dataset.paymentChoice];
    const note = document.createElement('small');
    note.textContent = 'Demo guidance · Available methods and prompts depend on your account and region. Enter payment details only in the real payment flow.';
    info.append(heading, guidance, note);
    if (choice.dataset.paymentChoice === 'Debit or credit card') {
      const link = document.createElement('a');
      link.href = 'https://portal.adpos.io/n/home';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Explore Adpos virtual cards ↗';
      info.append(link);
    }
    info.focus({preventScroll:true});
    info.scrollIntoView({block:'nearest',behavior:'smooth'});
  });
}

const pagePathNotes = {
  create: {
    title: 'Starting fresh',
    steps: ['The client creates a Page for their own business using its name, category and business details.', 'Review the Page and complete any setup prompts Meta displays.', 'Grant the advertising access needed for the workspace, then select the Page when creating an ad.'],
    tip: 'Creating a Page gives your business its public identity on Facebook. Keep ownership with the client.'
  },
  access: {
    title: 'Already have a business Page?',
    steps: ['Choose Request shared access, then find the Page by its name or URL.', 'Review the permissions needed to advertise and send the access request.', 'Someone with full control of the Page reviews and approves the request. Check that access is active before using the Page for ads.'],
    tip: 'Shared access lets another business work with the Page while its owner keeps ownership. A pending request still needs approval.'
  }
};
for (const button of document.querySelectorAll('[data-page-path]')) {
  button.addEventListener('click', () => {
    const content = pagePathNotes[button.dataset.pagePath];
    const notes = document.getElementById('page-path-notes');
    notes.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = content.title;
    const steps = document.createElement('ol');
    for (const text of content.steps) {
      const item = document.createElement('li');
      item.textContent = text;
      steps.append(item);
    }
    const tip = document.createElement('p');
    tip.textContent = content.tip;
    notes.append(title, steps, tip);
    notes.hidden = false;
    for (const option of document.querySelectorAll('[data-page-path]')) option.setAttribute('aria-expanded', String(option === button));
    notes.focus({preventScroll:true});
    notes.scrollIntoView({block:'nearest'});
  });
}
