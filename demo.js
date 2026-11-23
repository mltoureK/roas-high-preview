const steps = [
  {
    short: 'Connect agent',
    title: 'Connect the local agent',
    group: 'Set up Multilogin',
    task: 'The local agent is the small desktop helper app that launches browser profiles on your computer. Click below to simulate connecting it—nothing is downloaded or installed here.',
    expect: 'Status switches from Disconnected to Connected (simulated) before you continue.',
    help: 'In a live setup, if the dashboard still shows disconnected, open the installed Multilogin desktop agent and retry Connect agent.',
    action: 'Connect agent'
  },
  {
    short: 'Join workspace',
    title: 'Join the invited workspace',
    group: 'Set up Multilogin',
    task: 'Open the Multilogin invitation in the sample inbox, choose Join workspace, and create or sign in to your Multilogin account.',
    expect: 'Studio North appears in your workspace switcher.',
    help: 'If the invitation is missing or expired, ask the workspace administrator to confirm the address and resend it.',
    action: 'Join workspace'
  },
  {
    short: 'Find profile',
    title: 'Find your assigned profile',
    group: 'Open your workspace',
    task: 'Inside Profiles / Studio North / Shared folder, locate Studio North using the list or search box.',
    expect: 'You can identify the exact profile named in your written setup guide.',
    help: 'If the shared folder is empty, check the workspace name and ask your administrator to confirm your folder access.',
    action: 'Select profile'
  },
  {
    short: 'Start profile',
    title: 'Start the browser profile',
    group: 'Open your workspace',
    task: 'Choose Start profile beside Studio North to launch the profile browser window.',
    expect: 'A browser window opens. Websites may still ask you to sign in or verify access.',
    help: 'If no window opens, verify the local desktop agent is running. Reply to your setup thread with the step and error text.',
    action: 'Start profile'
  },
  {
    short: 'Ad accounts',
    title: 'Connect or open Ads Manager',
    group: 'Find your ad tools',
    task: 'Preview how a business adds, creates, or requests an ad account—or open Ads Manager directly if already connected.',
    expect: 'The ad account selector and Campaigns view reflect your assigned permissions.',
    help: 'A Multilogin invitation only grants workspace access. If an ad account is missing, ask the Meta business administrator to check assigned assets.',
    action: 'Open Ads Manager'
  },
  {
    short: 'Review campaign',
    title: 'Read campaign status',
    group: 'Find your ad tools',
    task: 'Locate Spring collection in the sample table and verify its Delivery and Spent columns before making changes.',
    expect: 'Spring collection is marked Draft with $0 spent.',
    help: 'In your own account, names and reporting dates will differ. Confirm the selected account and date range first.',
    action: 'Finish walkthrough'
  }
];

const pictures = ['assets/connect-agent.webp', 'assets/workspace-invitation.webp', 'assets/browser-profiles.webp'];
const sequence = [-1, 1, 0, 2, 3, 4, 5];

const pathsEl = document.getElementById('paths');
const guidedEl = document.getElementById('guided');
const sceneEl = document.getElementById('scene');
const navEl = document.getElementById('stages');
const backBtn = document.getElementById('previous');
const barEl = document.getElementById('tour-progress');
const lightbox = document.getElementById('lightbox');

let stage = -1;
let mailOpen = false;
let welcomeOpen = false;
let agentConnected = false;

const accountOptions = {
  existing: [
    'Add an existing ad account',
    'Use this when your business owns the account. Review the account ID and business owner before adding it.',
    'Studio North · Existing sample account',
    'Preview added account'
  ],
  create: [
    'Create a new ad account',
    'Use this when your business needs a new account. Review name, currency, and time zone. Permissions and portfolio limits determine availability.',
    'Studio North · USD · Eastern time',
    'Preview new account'
  ],
  request: [
    'Request access',
    'For a client-owned account, request permission. The owner keeps the account and reviews the request.',
    'Client Studio · Sample access request',
    'Preview access request'
  ]
};

function accountMenu() {
  return `
    <div class="sim-bar"><span>Business portfolio settings</span><small>Simulated</small></div>
    <div class="sim-path">Accounts / Ad accounts / Add</div>
    <div class="sim-pad">
      <strong>How will you connect an ad account?</strong>
      <div class="acct-list">
        ${Object.entries(accountOptions).map(([k, o]) => `<button type="button" class="acct-opt" data-account="${k}"><span>${o[0]}</span><span aria-hidden="true">→</span></button>`).join('')}
      </div>
    </div>`;
}

document.addEventListener('click', (event) => {
  const host = event.target.closest('[data-accounts]');
  if (!host) return;
  const btn = event.target.closest('button');
  if (!btn) return;
  if (btn.hasAttribute('data-menu')) {
    host.innerHTML = accountMenu();
  } else if (btn.dataset.account) {
    const k = btn.dataset.account;
    const o = accountOptions[k];
    host.innerHTML = `
      <div class="sim-bar"><span>${o[0]}</span><small>Simulated</small></div>
      <div class="sim-pad">
        <div class="acct-box">
          <b>${o[2]}</b>
          <p>${o[1]}</p>
          <div class="acct-btns">
            <button type="button" class="btn" data-result="${k}">${o[3]}</button>
            <button type="button" class="btn-ghost" data-menu>Back to options</button>
          </div>
        </div>
      </div>`;
  } else if (btn.dataset.result) {
    const k = btn.dataset.result;
    const titles = {
      existing: 'Existing sample account added',
      create: 'New sample account created',
      request: 'Sample request pending owner approval'
    };
    const msg = k === 'request'
      ? 'The client account becomes available only after approval. You can still explore Studio North’s sample campaigns.'
      : 'Your sample account is ready to explore. Campaigns and ads are created in Ads Manager.';
    const nextAction = host.dataset.accounts === 'step'
      ? '<button type="button" class="btn" data-continue>Continue to campaigns</button>'
      : '<button type="button" class="btn" data-launch="campaigns">Explore sample Ads Manager</button>';
    host.innerHTML = `
      <div class="sim-bar"><span>Preview result</span><small>Simulated</small></div>
      <div class="sim-pad">
        <div class="acct-box">
          <b>${titles[k]}</b>
          <p>${msg}</p>
          <div class="acct-btns">
            ${nextAction}
            <button type="button" class="btn-ghost" data-menu>Try another option</button>
          </div>
        </div>
      </div>`;
  } else {
    return;
  }
  host.querySelector('button')?.focus();
});

barEl.max = sequence.length;
sequence.forEach((index, pos) => {
  const label = index === -1 ? 'Welcome email' : steps[index].short;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = `${pos + 1}. ${label}`;
  btn.onclick = () => show(index, true);
  navEl.append(btn);
});

function choosePath(moveFocus = true) {
  pathsEl.hidden = false;
  guidedEl.hidden = true;
  if (moveFocus) document.getElementById('new-path').focus();
}

function openGuide(index, focusHeading = true) {
  pathsEl.hidden = true;
  guidedEl.hidden = false;
  show(index, focusHeading);
}

document.getElementById('switch-path').onclick = () => choosePath(true);
document.getElementById('new-path').onclick = () => { welcomeOpen = false; openGuide(-1, true); };

function openLightbox(src, alt) {
  lightbox.querySelector('img').src = src;
  lightbox.querySelector('img').alt = alt;
  document.getElementById('lightbox-caption').textContent = alt;
  lightbox.showModal();
}

function renderProfileFrame(isStart) {
  const imgSrc = pictures[2];
  const imgAlt = isStart ? 'Start control beside the browser profile' : 'Browser profiles list in Multilogin';
  return `
    <div>
      <div class="sim-frame">
        <div class="sim-bar"><span>Multilogin · Profiles</span><small>Simulated</small></div>
        <div class="sim-path">Profiles / Studio North / Shared folder</div>
        <div class="sim-pad">
          <label class="search-field">
            <span>Search profiles</span>
            <input id="profile-search" type="search" placeholder="Type Studio North" autocomplete="off">
          </label>
          <div class="profile-row" id="demo-row">
            <div>
              <b>Studio North</b>
              <small>Shared folder · Browser profile ready</small>
            </div>
            <button id="profile-action" class="btn" type="button">${isStart ? '▶ Start profile' : 'Select profile'}</button>
          </div>
          <p id="no-profiles" class="empty-msg" aria-live="polite" hidden>No matching profile. Try Studio North.</p>
        </div>
      </div>
      <figure class="ref-figure">
        <img src="${imgSrc}" alt="${imgAlt}">
        <figcaption>
          <span>Multilogin Help Center</span>
          <button type="button" class="btn-subtle zoom-btn" data-src="${imgSrc}" data-alt="${imgAlt}">Enlarge image</button>
        </figcaption>
      </figure>
    </div>`;
}

function renderSceneVisual(index) {
  if (index === 1) {
    const inbox = `
      <button type="button" id="invite-message" class="mail-row">
        <span class="unread-dot" aria-hidden="true"></span>
        <span><b>Multilogin</b><strong>Your workspace invitation</strong><span>Studio North invited you to join its workspace.</span></span>
        <span class="mail-open-cue">Open →</span>
      </button>`;
    const letter = `
      <button type="button" id="mail-back" class="btn-subtle" style="margin-bottom:.5rem">← Back to inbox</button>
      <div class="mail-letter">
        <div class="mail-from"><span class="mail-avatar" aria-hidden="true">M</span><div><strong>Multilogin</strong><small>To: demo teammate</small></div></div>
        <h4>Join Studio North</h4>
        <p>You’ve been invited to the Studio North workspace. Create a Multilogin account or sign in to accept.</p>
        <button type="button" class="btn" id="join-message">Join workspace</button>
        <button type="button" class="btn-subtle zoom-btn" data-src="${pictures[1]}" data-alt="Multilogin Help Center workspace invitation">View invitation reference</button>
      </div>`;
    return `
      <div class="sim-frame">
        <div class="sim-bar"><span>Mail · Inbox ${mailOpen ? '' : '(1 unread)'}</span><small>Sample inbox</small></div>
        <div class="sim-pad">${mailOpen ? letter : inbox}</div>
      </div>`;
  }

  if (index === 0) {
    return `
      <div>
        <div class="sim-frame">
          <div class="sim-bar"><span>Multilogin Web Dashboard</span><small>Simulated</small></div>
          <div class="sim-pad">
            <div class="agent-card">
              <div class="agent-head">
                <div>
                  <strong>Local desktop agent</strong>
                  <div style="font-size:.82rem;color:var(--ink-2)">Desktop helper that launches browser profiles</div>
                </div>
                <span class="status-badge ${agentConnected ? 'on' : 'off'}">${agentConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              ${agentConnected
                ? `<div class="agent-confirm" role="status">Local agent is connected. Your workspace can now launch browser profiles.</div>
                   <div class="scene-actions" style="margin-top:0">
                     <button type="button" class="btn" id="agent-continue">Continue to profiles →</button>
                     <button type="button" class="btn-subtle" id="agent-reset">Reset</button>
                   </div>`
                : `<div class="scene-actions" style="margin-top:0">
                     <button type="button" class="btn" id="agent-connect">Simulate connection</button>
                   </div>`
              }
            </div>
          </div>
        </div>
        <figure class="ref-figure">
          <img src="${pictures[0]}" alt="Multilogin local agent connection prompt">
          <figcaption>
            <span>Multilogin Help Center reference</span>
            <button type="button" class="btn-subtle zoom-btn" data-src="${pictures[0]}" data-alt="Multilogin local agent connection prompt">Enlarge image</button>
          </figcaption>
        </figure>
      </div>`;
  }

  if (index === 2 || index === 3) {
    return renderProfileFrame(index === 3);
  }

  if (index === 4) {
    return `
      <div>
        <div class="sim-frame">
          <div class="sim-bar"><span>Business portfolio · Ad accounts</span><small>Sample account</small></div>
          <div class="sim-pad">
            <div class="acct-box">
              <b>Studio North Ad Account</b>
              <p>Prepared sample account is ready. Open Ads Manager to review campaigns.</p>
              <div class="acct-btns">
                <button type="button" class="btn" id="open-ads">Open sample Ads Manager</button>
              </div>
            </div>
          </div>
        </div>
        <details style="margin-top:.75rem"${location.hash === '#ad-accounts' ? ' open' : ''}>
          <summary>Practice ad account setup</summary>
          <div class="sim-frame" style="margin-top:.5rem" data-accounts="step">${accountMenu()}</div>
        </details>
      </div>`;
  }

  return `
    <div>
      <div class="sim-frame">
        <div class="sim-bar"><span>Ads Manager · Studio North</span><small>Sample data</small></div>
        <div class="sim-path">Campaigns / Ad sets / Ads</div>
        <div class="sim-pad">
          <table class="data-table">
            <caption>Last 30 days</caption>
            <thead><tr><th>Campaign</th><th>Delivery</th><th>Spent</th></tr></thead>
            <tbody>
              <tr><td><strong>Spring collection</strong></td><td><span class="pill-status pill-draft">Draft</span></td><td>$0</td></tr>
              <tr><td>Studio launch</td><td><span class="pill-status pill-paused">Paused</span></td><td>$48</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="scene-actions">
        <button type="button" class="btn" id="finish-tour">Finish walkthrough</button>
        <button type="button" class="btn-ghost" data-launch="campaigns">Explore Ads Manager &amp; Events Manager</button>
      </div>
    </div>`;
}

function show(index, focus = false) {
  const pos = sequence.indexOf(index);
  const next = () => show(sequence[pos + 1] ?? steps.length, true);
  stage = index;
  if (index === 1 && focus) mailOpen = false;
  if (index === 0 && focus) agentConnected = false;

  const done = index === steps.length;
  barEl.value = done ? sequence.length : pos + 1;
  Array.from(navEl.children).forEach((btn, i) => btn.setAttribute('aria-current', i === pos ? 'step' : 'false'));
  backBtn.disabled = pos === 0;

  if (index === -1) {
    const inboxRow = `
      <button type="button" class="mail-row" id="open-welcome">
        <span class="unread-dot" aria-hidden="true"></span>
        <span><b>ROAS HIGH Setup</b><strong>Your Studio North workspace is ready</strong><span>Here’s how to get in for the first time.</span></span>
        <span class="mail-open-cue">Open →</span>
      </button>`;
    const welcomeLetter = `
      <button type="button" id="welcome-back" class="btn-subtle" style="margin-bottom:.5rem">← Back to inbox</button>
      <div class="mail-letter">
        <div class="mail-from"><span class="mail-avatar" aria-hidden="true">R</span><div><strong>ROAS HIGH Setup</strong><small>To: Studio North team</small></div></div>
        <h4>Your Studio North workspace is ready</h4>
        <p>Hi Alex, we’ve prepared your browser profile. Look for a separate invitation from Multilogin at this email address.</p>
        <ol>
          <li>Open the Multilogin invitation and choose <strong>Join workspace</strong>. Create or sign in to your Multilogin account.</li>
          <li>In the dashboard, connect the <strong>local agent</strong> (desktop helper app on your computer).</li>
          <li>Find <strong>Studio North</strong> under <em>Shared folder</em> and press <strong>Start</strong>.</li>
        </ol>
        <p>If your screen looks different, reply here with the step you reached.</p>
        <button type="button" class="btn" id="next-inbox">Find my invitation →</button>
      </div>`;

    sceneEl.innerHTML = `
      <div class="scene-grid">
        <div class="scene-info">
          <div class="scene-meta">Step 1 of 7 · Written onboarding</div>
          <h3 tabindex="-1">Your first setup email</h3>
          <p>Open the welcome message to preview your onboarding steps.</p>
        </div>
        <div class="sim-frame">
          <div class="sim-bar"><span>Mail · Inbox ${welcomeOpen ? '' : '(1 unread)'}</span><small>Sample inbox</small></div>
          <div class="sim-pad">${welcomeOpen ? welcomeLetter : inboxRow}</div>
        </div>
      </div>`;

    if (welcomeOpen) {
      document.getElementById('welcome-back').onclick = () => { welcomeOpen = false; show(-1, false); document.getElementById('open-welcome').focus(); };
      document.getElementById('next-inbox').onclick = next;
    } else {
      document.getElementById('open-welcome').onclick = () => {
        welcomeOpen = true;
        show(-1, false);
        document.getElementById('next-inbox').focus({ preventScroll: true });
      };
    }
  } else if (done) {
    sceneEl.innerHTML = `
      <div class="scene-grid single">
        <div class="scene-info">
          <div class="scene-meta">Walkthrough complete</div>
          <h3 tabindex="-1">You’ve reached the campaign view.</h3>
          <p>You’ve previewed the path from setup email to campaigns. In a live setup, your welcome email supplies your workspace and profile names.</p>
          <div class="scene-actions">
            <a class="btn" href="#request">Get setup details</a>
            <button type="button" class="btn-ghost" data-launch="profiles">Open full workspace sandbox</button>
            <button type="button" class="btn-subtle" id="replay">Replay walkthrough</button>
          </div>
        </div>
      </div>`;
    document.getElementById('replay').onclick = () => { welcomeOpen = false; openGuide(-1, true); };
  } else {
    const step = steps[index];
    sceneEl.innerHTML = `
      <div class="scene-grid">
        <div class="scene-info">
          <div class="scene-meta">Step ${pos + 1} of ${sequence.length} · ${step.group}</div>
          <h3 tabindex="-1">${step.title}</h3>
          <p>${step.task}</p>
          <details>
            <summary>My screen looks different</summary>
            <p><strong>What you should see:</strong> ${step.expect}</p>
            <p>${step.help}</p>
          </details>
        </div>
        <div>${renderSceneVisual(index)}</div>
      </div>`;

    if (index === 1) {
      if (mailOpen) {
        document.getElementById('mail-back').onclick = () => { mailOpen = false; show(1, false); document.getElementById('invite-message').focus(); };
        document.getElementById('join-message').onclick = next;
      } else {
        document.getElementById('invite-message').onclick = () => { mailOpen = true; show(1, false); document.getElementById('join-message').focus(); };
      }
    } else if (index === 0) {
      if (agentConnected) {
        document.getElementById('agent-continue').onclick = next;
        document.getElementById('agent-reset').onclick = () => { agentConnected = false; show(0, false); document.getElementById('agent-connect').focus(); };
      } else {
        document.getElementById('agent-connect').onclick = () => {
          agentConnected = true;
          show(0, false);
          document.getElementById('agent-continue').focus({ preventScroll: true });
        };
      }
    } else if (index === 2 || index === 3) {
      document.getElementById('profile-action').onclick = next;
      document.getElementById('profile-search').oninput = (e) => {
        const matches = 'studio north'.includes(e.target.value.trim().toLowerCase());
        document.getElementById('demo-row').hidden = !matches;
        document.getElementById('no-profiles').hidden = matches;
      };
    } else if (index === 4) {
      document.getElementById('open-ads').onclick = next;
      sceneEl.querySelector('[data-accounts]').addEventListener('click', (e) => {
        if (e.target.closest('[data-continue]')) next();
      });
    } else if (index === 5) {
      document.getElementById('finish-tour').onclick = next;
    }

    sceneEl.querySelectorAll('.zoom-btn').forEach((btn) => {
      btn.onclick = () => openLightbox(btn.dataset.src, btn.dataset.alt);
    });
  }

  if (focus) sceneEl.querySelector('h3')?.focus({ preventScroll: true });
}

backBtn.onclick = () => {
  const currentPos = stage === steps.length ? sequence.length : sequence.indexOf(stage);
  show(sequence[Math.max(0, currentPos - 1)], true);
};

function handleHash() {
  if (location.hash === '#join' || location.hash === '#ad-accounts') {
    if (location.hash === '#join') mailOpen = false;
    openGuide(location.hash === '#join' ? 1 : 4, false);
    document.getElementById('demo').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
}
if (location.hash === '#join' || location.hash === '#ad-accounts') handleHash();
else choosePath(false);
window.addEventListener('hashchange', handleHash);

/* Workspace Sandbox Explorer */
const explorer = document.getElementById('explorer');
const pane = document.getElementById('lab-pane');
const labNav = document.getElementById('lab-nav');
const coachEl = document.getElementById('coach');

const toolsList = {
  profiles: 'Browser profiles',
  campaigns: 'Ads Manager',
  events: 'Events Manager',
  billing: 'Billing',
  accounts: 'Ad account setup'
};

const campaigns = [
  { name: 'Spring collection', status: 'Draft', spend: '$0', audience: 'Spring prospects', ad: 'Collection preview', results: '0' },
  { name: 'Studio launch', status: 'Paused', spend: '$48', audience: 'Returning visitors', ad: 'Inside the studio', results: '12' }
];

const route = [
  ['start', 'Start the Studio North browser profile.'],
  ['tool-campaigns', 'Inside the browser window, open Ads Manager.'],
  ['campaign-1', 'Open Studio launch to inspect its ad set.'],
  ['level-2', 'Open Returning visitors to inspect its ad.'],
  ['tool-events', 'Ad summary loaded for Inside the studio. Choose Events Manager in the tool menu.'],
  ['event-1', 'Choose Test events to open the sample event stream.'],
  ['emit-buy', 'Select Simulate purchase and verify the receipt below.']
];

let tool = 'profiles';
let level = 0;
let selected = 0;
let eventTab = 'Overview';
let running = false;
let guidedMode = 'free'; // 'guided' | 'detour' | 'free' | 'done'
let guidedStep = 0;
let hasGuidedProgress = false;
const receipts = [];

function btnHtml(action, label, cls = '', pressed = null) {
  return `<button type="button" data-lab="${action}"${cls ? ` class="${cls}"` : ''}${pressed !== null ? ` aria-pressed="${pressed}"` : ''}>${label}</button>`;
}

function prepareStepView(stepIndex) {
  if (stepIndex === 0) { tool = 'profiles'; running = false; }
  else if (stepIndex === 1) { running = true; tool = 'browser'; }
  else if (stepIndex === 2) { tool = 'campaigns'; level = 0; }
  else if (stepIndex === 3) { tool = 'campaigns'; selected = 1; level = 1; }
  else if (stepIndex === 4) { tool = 'campaigns'; selected = 1; level = 2; }
  else if (stepIndex === 5) { tool = 'events'; eventTab = 'Overview'; }
  else if (stepIndex === 6) { tool = 'events'; eventTab = 'Test events'; }
}

function renderLab(focusHeading = false) {
  labNav.innerHTML = `<div class="lab-nav-label">Workspace tools</div>` +
    Object.entries(toolsList).filter(([key]) => tool !== 'browser' || !['campaigns', 'events'].includes(key)).map(([k, name]) => btnHtml(`tool-${k}`, name, '', k === tool)).join('');

  let body = '';
  if (tool === 'profiles') {
    body = `
      <div class="lab-crumb">Profiles / Studio North / Shared folder</div>
      <div class="lab-record">
        <div>
          <h4>Studio North</h4>
          <span>${running ? 'Running' : 'Ready to start'}</span>
        </div>
        ${btnHtml('start', running ? 'Open browser window' : '▶ Start profile', 'btn')}
      </div>`;
  } else if (tool === 'accounts') {
    body = `<div class="sim-frame" data-accounts>${accountMenu()}</div>`;
  } else if (tool === 'browser') {
    body = `
      <div class="browser-mock">
        <div class="browser-bar">
          <span>●</span>
          <span class="browser-url">Studio North Browser · Business tools</span>
        </div>
        <div class="browser-body">
          <div class="lab-tiles">
            <button type="button" class="tile-btn" data-lab="tool-campaigns">
              <span>▦ Ads Manager</span>
              <small>Campaigns, ad sets, and ads</small>
            </button>
            <button type="button" class="tile-btn" data-lab="tool-events">
              <span>⌁ Events Manager</span>
              <small>Website events and test stream</small>
            </button>
          </div>
        </div>
      </div>`;
  } else if (tool === 'campaigns') {
    const c = campaigns[selected];
    const names = ['Campaigns', 'Ad sets', 'Ads'];
    body = `<div class="lab-tabs">${names.map((n, i) => btnHtml(`level-${i}`, n, '', level === i)).join('')}</div>`;
    if (level > 0) {
      body += `<div class="lab-crumb">${c.name}${level === 2 ? ` / ${c.audience}` : ''}</div>`;
    }
    const colLabel = ['Campaign', 'Ad set', 'Ad'][level];
    const rows = level === 0
      ? campaigns.map((r, i) => `<tr><td>${btnHtml(`campaign-${i}`, r.name, 'table-link')}</td><td><span class="pill-status ${r.status === 'Draft' ? 'pill-draft' : 'pill-paused'}">${r.status}</span></td><td>${r.spend}</td></tr>`).join('')
      : `<tr><td>${level === 1 ? btnHtml('level-2', c.audience, 'table-link') : `<strong>${c.ad}</strong>`}</td><td><span class="pill-status ${c.status === 'Draft' ? 'pill-draft' : 'pill-paused'}">${c.status}</span></td><td>${c.spend}</td></tr>`;
    body += `<table class="data-table"><thead><tr><th>${colLabel}</th><th>Delivery</th><th>Spent</th></tr></thead><tbody>${rows}</tbody></table>`;
    if (level === 2) {
      body += `
        <div class="lab-record">
          <div>
            <small>AD SUMMARY · SAMPLE DATA</small>
            <h4>${c.ad}</h4>
            <span>${c.results} example results · ${c.spend} spent</span>
          </div>
        </div>`;
    }
  } else if (tool === 'events') {
    body = `
      <div class="lab-crumb">Data source / Studio North website</div>
      <div class="lab-tabs">${['Overview', 'Test events', 'Diagnostics'].map((n, i) => btnHtml(`event-${i}`, n, '', eventTab === n)).join('')}</div>`;
    if (eventTab === 'Overview') {
      body += `
        <table class="data-table" style="margin-bottom:.85rem">
          <thead><tr><th>Event</th><th>Example count</th></tr></thead>
          <tbody>
            <tr><td>PageView</td><td>240</td></tr>
            <tr><td>ViewContent</td><td>86</td></tr>
            <tr><td>Purchase</td><td>12</td></tr>
          </tbody>
        </table>
        `;
    } else if (eventTab === 'Test events') {
      body += `
        <div class="lab-tabs">
          ${btnHtml('emit-view', 'Simulate page visit', 'btn-ghost')}
          ${btnHtml('emit-buy', 'Simulate purchase', 'btn')}
        </div>
        <div aria-live="polite" class="lab-log">
          ${receipts.length
            ? receipts.map((r) => `<div class="receipt-row">✓ ${r} · Received in sandbox</div>`).join('')
            : '<div>Waiting for sample event…</div>'}
        </div>`;
    } else {
      body += `
        <details open style="margin-bottom:.85rem">
          <summary>Purchase event missing currency</summary>
          <p>In this sample, a purchase includes a value without a currency field. Use Test events to inspect a corrected example.</p>
        </details>
        ${btnHtml('event-1', 'Go to Test events', 'btn')}`;
    }
  } else {
    body = `
      <div class="lab-crumb">Billing activity / Studio North</div>
      <table class="data-table" style="margin-bottom:.85rem">
        <thead><tr><th>Item</th><th>Amount</th></tr></thead>
        <tbody><tr><td>Studio launch · campaign spend</td><td>$48</td></tr></tbody>
      </table>
      <button type="button" class="btn-ghost" data-lab="bill-info" aria-expanded="false">View billing details</button>
      <div id="bill-info" hidden style="margin-top:.75rem">
        <p>This illustrative amount is campaign spend. Only authorized billing roles can manage actual billing settings.</p>
      </div>`;
  }

  pane.innerHTML = `<h3 tabindex="-1">${toolsList[tool] || 'Browser window'}</h3>${body}`;
  if (focusHeading) pane.querySelector('h3')?.focus();
}

function renderCoach() {
  explorer.querySelectorAll('.next-click').forEach((el) => el.classList.remove('next-click'));
  coachEl.className = 'coach-bar';

  if (guidedMode === 'done') {
    coachEl.classList.add('done');
    coachEl.innerHTML = `
      <div class="coach-copy">
        <small>Practice complete · 7 of 7</small>
        <strong>You inspected an ad and verified a simulated purchase receipt.</strong>
      </div>
      <div class="coach-actions">
        ${btnHtml('guided', 'Practice again', 'btn-ghost')}
        ${btnHtml('free', 'Explore freely', 'btn-subtle')}
      </div>`;
    return;
  }

  if (guidedMode === 'detour') {
    coachEl.classList.add('detour');
    coachEl.innerHTML = `
      <div class="coach-copy">
        <small>Detour · Paused at step ${guidedStep + 1} of ${route.length}</small>
      </div>
      <div class="coach-actions">
        ${btnHtml('resume', `Resume step ${guidedStep + 1}`, 'btn')}
        ${btnHtml('guided', 'Restart', 'btn-subtle')}
      </div>`;
    return;
  }

  if (guidedMode === 'free') {
    coachEl.classList.add('free');
    coachEl.innerHTML = `
      <div class="coach-copy">
        <small>Free exploration</small>
      </div>
      <div class="coach-actions">
        ${hasGuidedProgress && guidedStep < route.length ? btnHtml('resume', `Resume step ${guidedStep + 1}`, 'btn') : ''}
        ${btnHtml('guided', 'Start guided practice', hasGuidedProgress && guidedStep < route.length ? 'btn-ghost' : 'btn')}
      </div>`;
    return;
  }

  const [action, hint] = route[guidedStep];
  const target = pane.querySelector(`[data-lab="${action}"]`) || explorer.querySelector(`[data-lab="${action}"]`);
  if (!target) {
    guidedMode = 'detour';
    renderCoach();
    return;
  }
  target.classList.add('next-click');
  coachEl.innerHTML = `
    <div class="coach-copy">
      <small>Guided practice · Step ${guidedStep + 1} of ${route.length}</small>
      <strong>${hint}</strong>
    </div>
    <div class="coach-actions">
      ${btnHtml('free', 'Explore freely', 'btn-subtle')}
    </div>`;
}

document.addEventListener('click', (e) => {
  const launch = e.target.closest('[data-launch]');
  if (launch) {
    const dest = launch.dataset.launch;
    if (dest === 'profiles') {
      tool = 'profiles';
      level = 0;
      selected = 0;
      running = false;
      eventTab = 'Overview';
      receipts.length = 0;
      guidedMode = 'guided';
      guidedStep = 0;
      hasGuidedProgress = true;
    } else {
      tool = dest;
      level = 0;
      if (guidedMode === 'guided') guidedMode = 'detour';
      else guidedMode = 'free';
    }
    renderLab(false);
    renderCoach();
    if (!explorer.open) explorer.showModal();
    return;
  }

  const btn = e.target.closest('[data-lab]');
  if (!btn) return;
  const a = btn.dataset.lab;

  if (a === 'guided') {
    tool = 'profiles';
    level = 0;
    selected = 0;
    running = false;
    eventTab = 'Overview';
    receipts.length = 0;
    guidedMode = 'guided';
    guidedStep = 0;
    hasGuidedProgress = true;
    renderLab(true);
    renderCoach();
    return;
  }

  if (a === 'resume') {
    prepareStepView(guidedStep);
    guidedMode = 'guided';
    hasGuidedProgress = true;
    renderLab(false);
    renderCoach();
    explorer.querySelector('.next-click')?.focus();
    return;
  }

  if (a === 'free') {
    guidedMode = 'free';
    renderCoach();
    return;
  }

  if (a === 'bill-info') {
    const info = document.getElementById('bill-info');
    info.hidden = !info.hidden;
    btn.setAttribute('aria-expanded', String(!info.hidden));
    return;
  }

  if (guidedMode === 'guided') {
    if (a === route[guidedStep][0]) {
      guidedStep += 1;
      if (guidedStep >= route.length) guidedMode = 'done';
    } else {
      guidedMode = 'detour';
    }
  }

  if (a.startsWith('tool-')) { tool = a.slice(5); level = 0; }
  if (a === 'start') { running = true; tool = 'browser'; }
  if (a.startsWith('campaign-')) { selected = Number(a.slice(9)); level = 1; }
  if (a.startsWith('level-')) { level = Number(a.slice(6)); }
  if (a.startsWith('event-')) { eventTab = ['Overview', 'Test events', 'Diagnostics'][Number(a.slice(6))]; }
  if (a.startsWith('emit-')) {
    receipts.unshift(a === 'emit-buy' ? 'Purchase · USD 24.00' : 'PageView');
    receipts.splice(8);
  }

  renderLab(!a.startsWith('emit-'));
  renderCoach();
  if (a.startsWith('emit-')) pane.querySelector(`[data-lab="${a}"]`)?.focus();
});

document.getElementById('exit-lab').onclick = () => explorer.close();
document.getElementById('close-lightbox').onclick = () => lightbox.close();
[explorer, lightbox].forEach((dlg) => {
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close();
  });
});

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
