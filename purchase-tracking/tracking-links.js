(() => {
	const domains = document.getElementById('rh-domains');
	const destination = document.getElementById('rh-destination');
	if (domains && destination) {
		const store = new URL(destination.dataset.base);
		const output = document.getElementById('rh-store-links');
		const status = document.getElementById('rh-link-status');
		const hostname = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

		function renderLinks() {
			const entries = domains.value.trim().split(/[\s,]+/).filter(Boolean);
			const hosts = [...new Set(entries.map(entry => entry.toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '')))];
			let url;
			try { url = new URL(destination.value); } catch { /* An unfinished URL has no preview. */ }
			output.replaceChildren();
			domains.setCustomValidity(hosts.every(host => hostname.test(host)) ? '' : 'Enter a hostname or a homepage URL without a path.');
			destination.setCustomValidity(url && url.origin === store.origin && !url.username && !url.password ? '' : 'Enter a store URL on ' + store.host + '.');
			status.textContent = domains.validationMessage || destination.validationMessage || (hosts.length ? '' : 'Enter a landing domain above to see its button link.');
			if (status.textContent) return;
			for (const host of hosts) {
				url.searchParams.set('quote_entry_site', host);
				const row = document.createElement('div');
				row.className = 'rh-field';
				const label = document.createElement('label');
				label.textContent = host;
				const input = document.createElement('input');
				input.className = 'rh-input';
				input.readOnly = true;
				input.value = url.href;
				label.append(input);
				const copy = document.createElement('button');
				copy.type = 'button';
				copy.className = 'rh-button rh-secondary';
				copy.textContent = 'Copy link';
				copy.setAttribute('aria-label', 'Copy link for ' + host);
				copy.addEventListener('click', async () => {
					try {
						await navigator.clipboard.writeText(input.value);
						status.textContent = 'Link copied for ' + host + '.';
					} catch {
						input.select();
						status.textContent = 'Link selected. Use your device’s Copy command.';
					}
				});
				row.append(label, copy);
				output.append(row);
			}
		}

		domains.addEventListener('input', renderLinks);
		destination.addEventListener('input', renderLinks);
		renderLinks();
	}
})();
