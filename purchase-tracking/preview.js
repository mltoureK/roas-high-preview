(() => {
  const byId = id => document.getElementById(id);
  const steps = [...document.querySelectorAll('.rh-step')];
  const progress = [...document.querySelectorAll('.rh-progress i')];
  const reviewed = byId('reviewed');
  const enable = byId('enable');
  let completed = 0;

  function advance(count, focusIndex) {
    completed = count;
    steps.forEach((step, index) => {
      step.classList.toggle('is-done', index < count);
      step.classList.toggle('is-current', index === count);
      step.open = index === focusIndex;
      progress[index].classList.toggle('is-done', index < count);
    });
    document.querySelector('.rh-count').textContent = count + ' of 3 complete';
    byId('dataset-status').textContent = count >= 1 ? 'Sample dataset connected' : 'Awaiting setup';
    byId('token-status').textContent = count >= 1 ? 'Sample token selected' : 'Awaiting setup';
    byId('test-status').textContent = count >= 2 ? 'Sample receipt · Purchase · C$1.00' : 'Awaiting test';
    byId('test-hint').textContent = count >= 1 ? 'This preview simulates the test locally.' : 'Save the sample connection in step 1 to unlock the test.';
    byId('review-hint').textContent = count < 2 ? 'Finish the sample test in step 2 to unlock this step.' :
      count === 2 ? 'Sample receipt: Purchase · Server · C$1.00. In the installed plugin, confirm the event in Meta before enabling delivery.' :
      'Preview complete. On an installed store, eligible paid orders can now send a Purchase event.';
    byId('test').disabled = count < 1;
    reviewed.disabled = count !== 2;
    byId('sending-status').textContent = count === 3 ? 'Sending on in preview' : 'Live sending off';
    document.querySelector('.rh-live-pill').classList.toggle('is-live', count === 3);
    enable.hidden = count === 3;
    enable.disabled = count !== 2 || !reviewed.checked;
    byId('restart').hidden = count !== 3;
    steps[focusIndex].querySelector('summary').focus();
  }

  byId('connect').addEventListener('click', () => {
    reviewed.checked = false;
    advance(1, 1);
  });
  byId('test').addEventListener('click', () => {
    reviewed.checked = false;
    advance(2, 2);
  });
  reviewed.addEventListener('change', () => { enable.disabled = completed !== 2 || !reviewed.checked; });
  enable.addEventListener('click', () => advance(3, 2));
  byId('restart').addEventListener('click', () => {
    reviewed.checked = false;
    advance(0, 0);
  });
  byId('copy-address').addEventListener('click', async () => {
    const address = byId('events-address');
    try {
      await navigator.clipboard.writeText(address.value);
      byId('copy-status').textContent = 'Address copied. Paste it inside your Multilogin profile.';
    } catch {
      address.select();
      byId('copy-status').textContent = 'Address selected. Use your device’s Copy command.';
    }
  });
})();
