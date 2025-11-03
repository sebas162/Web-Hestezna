// Menú móvil accesible: alterna la clase .open en .nav y el estado aria-expanded en el botón
document.addEventListener('DOMContentLoaded', () => {
	// Detect support for backdrop-filter; if missing, add .no-backdrop to <html>
	try {
		const supports = CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
		if (!supports) document.documentElement.classList.add('no-backdrop');
	} catch (e) {
		// older browsers may not have CSS.supports
		document.documentElement.classList.add('no-backdrop');
	}
	// Menú móvil legacy eliminado (no usado en el layout actual)
	
		// Smooth scroll for contact links and set active nav
		(function(){
			// Only intercept when #contact exists on the current page.
			// If the link points to a different page (e.g. index.html#contact), allow normal navigation.
			document.querySelectorAll('a[href="#contact"], a[href$="#contact"], a[href*="#contact"]').forEach(a=>{
				a.addEventListener('click', (ev)=>{
					const href = a.getAttribute('href') || '';
					let samePage = false;
					try {
						const url = new URL(a.href, window.location.href);
						samePage = (url.pathname === window.location.pathname) || href.startsWith('#');
					} catch(e){
						samePage = href.startsWith('#');
					}

					if(!samePage){
						return; // different page — let the browser navigate
					}

					const target = document.getElementById('contact');
					if(target){
						ev.preventDefault();
						target.scrollIntoView({behavior:'smooth',block:'start'});
						history.replaceState(null, '', window.location.pathname + '#contact');
					}
				});
			});

			// Set active nav link based on current page. On privacy/terms, none is highlighted.
			const navLinks = Array.from(document.querySelectorAll('.top-links a'));
			function setActive(){
				const file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
				const hash = (window.location.hash || '').toLowerCase();
				navLinks.forEach(a=> a.classList.remove('active'));

					if (file === 'index.html' || file === '') {
						if (hash.includes('contact')) {
							// highlight the direct contact link when on #contact
							navLinks.find(a=> (a.getAttribute('href')||'').includes('#contact'))?.classList.add('active');
						} else {
							// highlight the first nav item (Home/Inicio) regardless of language
							navLinks[0]?.classList.add('active');
						}
					} else if (file.includes('casos') || file.includes('cases')) {
						// highlight Portfolio/Portafolio regardless of language
						navLinks.find(a=>{
							const txt = (a.textContent||'').trim().toLowerCase();
							const href = (a.getAttribute('href')||'').toLowerCase();
							return txt==='portafolio' || txt==='portfolio' || href.includes('casos') || href.includes('cases');
						})?.classList.add('active');
					} else if (file.includes('privacy') || file.includes('terms')) {
					// Do not highlight any link on the privacy page
				} else {
					// For other standalone pages, leave all unhighlighted
				}
			}
			setActive();
			window.addEventListener('hashchange', setActive);
		})();

		// Reveal animation for case cards using IntersectionObserver (staggered)
		(function(){
			const cards = Array.from(document.querySelectorAll('.case-card'));
			if(!cards.length) return;

			function revealAll(){ cards.forEach(c=> c.classList.add('in-view')); }

			if('IntersectionObserver' in window){
				const obs = new IntersectionObserver((entries)=>{
					entries.forEach((entry, idx)=>{
						if(entry.isIntersecting && !entry.target.classList.contains('in-view')){
							// staggered reveal
							setTimeout(()=>{
								entry.target.classList.add('in-view');
							}, idx * 90);
						}
					});
				},{root: null, threshold: 0.12});
				cards.forEach(c=> obs.observe(c));
				// safety: if nothing is revealed after a short delay (edge cases), reveal all
				setTimeout(()=>{
					const any = cards.some(c=> c.classList.contains('in-view'));
					if(!any) revealAll();
				}, 700);
			} else {
				// Older browsers: no IntersectionObserver -> reveal all immediately
				revealAll();
			}
		})();



	// Sticky-like visual state using position:sticky and a visual "scrolled" class
	(function(){
		const nav = document.querySelector('.top-nav');
		if(!nav) return;
		let ticking = false;
		const threshold = 56; // px scrolled before visual state
		const wantsOverHero = document.body.classList.contains('over-hero-page');

		// persistent spacer element (exists in markup) to preserve document flow
		const persistentSpacer = document.querySelector('.nav-spacer');

		function syncSpacer(){
			if(!persistentSpacer) return;
			persistentSpacer.style.height = '64px';
		}

		// sync immediately and on resize
		syncSpacer();
		window.addEventListener('resize', ()=>{ if(window.requestAnimationFrame) requestAnimationFrame(syncSpacer); else syncSpacer(); });

		function onScroll(){
			if(ticking) return; ticking = true;
			requestAnimationFrame(()=>{
				if(window.scrollY > threshold) nav.classList.add('scrolled');
				else nav.classList.remove('scrolled');

				// Toggle high-contrast state when page requests over-hero behavior
				if (wantsOverHero) {
					if (window.scrollY <= 12) nav.classList.add('over-hero');
					else nav.classList.remove('over-hero');
				} else {
					nav.classList.remove('over-hero');
				}
				ticking = false;
			});
		}

		window.addEventListener('scroll', onScroll, {passive:true});
		window.addEventListener('resize', onScroll);
		// run once on load in case user lands scrolled
		onScroll();
	})();

	// Contact form: validation, anti-spam and Web3Forms submitter
	(function(){
		const forms = Array.from(document.querySelectorAll('.contact-form-minimal'));
		if(!forms.length) return;

		const cfg = (window.TOKENS_V1 && window.TOKENS_V1.contactForm) ? window.TOKENS_V1.contactForm : { web3forms: {} };

		forms.forEach(form => {
			const btn = form.querySelector('.btn-submit');
			const statusEl = form.querySelector('.form-status');
			const hp = form.querySelector('.hp-field');
			let startedAt = 0;

			// mark interaction start to detect bots (very fast submissions)
			form.addEventListener('input', () => { if(!startedAt) startedAt = Date.now(); }, { once: true });

			function setStatus(kind, msg){
				if(!statusEl) return;
				statusEl.hidden = false;
				statusEl.textContent = msg || '';
				statusEl.classList.remove('success','error');
				if(kind) statusEl.classList.add(kind);
			}

			async function submitHandler(ev){
				ev.preventDefault();
				const name = form.querySelector('#name')?.value.trim();
				const email = form.querySelector('#email')?.value.trim();
				const phone = form.querySelector('#phone')?.value.trim();
				const message = form.querySelector('#message')?.value.trim();

				// basic validation
				const errors = [];
				if(!name) errors.push('Ingresa tu nombre.');
				if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Ingresa un email válido.');
				if(!message) errors.push('Cuéntanos brevemente tu proyecto.');
				if(errors.length){ setStatus('error', errors.join(' ')); return; }

				// anti-spam: honeypot or too-fast submission
				if(hp && hp.value){ setStatus('error', 'No se pudo enviar.'); return; }
				const delta = startedAt ? (Date.now() - startedAt) : 0;
				if(delta && delta < 1200){ setStatus('error', 'Espera un momento y vuelve a intentar.'); return; }

				// UI: loading state
				btn?.classList.add('is-loading');
				if(btn) btn.disabled = true;
				setStatus(null, '');

				const payload = { name, email, phone, message, to: cfg.emailTo || 'info@hestezna.com', origin: window.location.href };

				try {
					const accessKey = cfg.web3forms && cfg.web3forms.accessKey;
					if(!accessKey){ throw new Error('Access Key de Web3Forms no configurada.'); }
					const fd = new FormData(form);
					// Ensure required fields exist
					if(!fd.has('access_key')) fd.append('access_key', accessKey);
					if(cfg.web3forms && cfg.web3forms.subject && !fd.has('subject')){
						fd.append('subject', cfg.web3forms.subject);
					}
					// No captcha: enviar directamente
					fd.append('page', window.location.href);
					const resp = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
					const data = await resp.json();
					if(data && data.success === true){
						setStatus('success', 'Gracias. Hemos recibido tu mensaje y te contactaremos pronto.');
						form.reset();
						startedAt = 0;
					} else {
						const errMsg = (data && data.message) ? data.message : 'No se pudo enviar (Web3Forms).';
						setStatus('error', errMsg);
					}
				} catch (e){
					setStatus('error', e && e.message ? e.message : 'Error al enviar.');
				} finally {
					btn?.classList.remove('is-loading');
					if(btn) btn.disabled = false;
					// No captcha: nada que resetear
				}
			}

			form.addEventListener('submit', submitHandler);
		});
	})();

	// Language toggle: set ES/EN link to the corresponding counterpart page and show flag icons
	(function(){
		const toggle = document.querySelector('.lang-toggle');
		if(!toggle) return;
		const path = window.location.pathname;
		const isEN = /\/en\//.test(path);
		const file = path.split('/').pop() || 'index.html';
		const mapToEN = { 'index.html':'index.html', 'casos.html':'cases.html', 'privacy.html':'privacy.html', 'terms.html':'terms.html' };
		const mapToES = { 'index.html':'index.html', 'cases.html':'casos.html', 'privacy.html':'privacy.html', 'terms.html':'terms.html' };
		const target = isEN ? (mapToES[file] || 'index.html') : (mapToEN[file] || 'index.html');
		// Use relative links so it works under subpaths (e.g., GitHub Pages)
		const href = isEN ? ('../' + target) : ('en/' + target);

		const code = isEN ? 'ES' : 'EN';
		const langAttr = isEN ? 'es' : 'en';
		toggle.setAttribute('lang', langAttr);
		toggle.setAttribute('href', href);
		// Choose proper relative icon path depending on current language context
		const iconFile = isEN ? 'mx.svg' : 'us.svg';
		const iconPath = isEN ? ('../assets/icons/' + iconFile) : ('assets/icons/' + iconFile);
		// Render image + code (sizes handled in CSS for perfect vertical centering)
		toggle.innerHTML = `<img src="${iconPath}" alt="${code} flag">${code}`;
	})();

});

	// (TOC removed - ultra-minimal layout)
