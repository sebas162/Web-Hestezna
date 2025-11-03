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
	const btn = document.querySelector('.nav-toggle');
	const nav = document.querySelector('.nav');

	// Only attach mobile menu handlers if both elements exist.
	// Do NOT abort initialization here; other features (smooth-scroll, observer, accordion)
	// should run even when the site uses a different nav markup (.top-nav /.top-links).
	if (btn && nav) {
		btn.addEventListener('click', (ev) => {
			ev.stopPropagation();
			const isOpen = nav.classList.toggle('open');
			btn.setAttribute('aria-expanded', String(isOpen));
			// Cambiar SVG interno del botón
			btn.innerHTML = isOpen ? (
				`<!-- close -->
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
					<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
				</svg>`
			) : (
				`<!-- menu -->
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
					<path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
				</svg>`
			);
		});

		// Cerrar el menú al hacer click en un enlace (mejora UX)
		nav.addEventListener('click', (e) => {
			const target = e.target;
			if (target.tagName === 'A' && nav.classList.contains('open')) {
				nav.classList.remove('open');
				btn.setAttribute('aria-expanded', 'false');
				// restaurar icono de menu
				btn.innerHTML = `<!-- menu -->
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
						<path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
					</svg>`;
			}
		});

		// Cerrar el menú al hacer click fuera
		document.addEventListener('click', (e) => {
			if (!nav.classList.contains('open')) return;
			const path = e.composedPath ? e.composedPath() : [];
			if (!path.includes(nav) && !path.includes(btn)) {
				nav.classList.remove('open');
				btn.setAttribute('aria-expanded', 'false');
				btn.innerHTML = `<!-- menu -->
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
						<path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
					</svg>`;
			}
		});
	}
	
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


		// Accordion behavior for in-page service details
	(function(){
	  const toggles = Array.from(document.querySelectorAll('.service-toggle'));
	  if (!toggles.length) return;
	
		function closePanel(btn){
			const id = btn.getAttribute('aria-controls');
			const panel = document.getElementById(id);
			if(!panel) return;
			btn.setAttribute('aria-expanded','false');
			panel.setAttribute('aria-hidden','true');
			// animate collapse: set current height then to 0 so CSS transition runs
			const full = panel.scrollHeight + 24;
			panel.style.maxHeight = full + 'px';
			// next frame, collapse
			requestAnimationFrame(() => { panel.style.maxHeight = '0px'; });
			// cleanup after transition
			const cleanup = () => { panel.style.maxHeight = null; panel.removeEventListener('transitionend', cleanup); };
			panel.addEventListener('transitionend', cleanup);
		}
	
	  function openPanel(btn){
	    const id = btn.getAttribute('aria-controls');
	    const panel = document.getElementById(id);
	    if(!panel) return;
	    btn.setAttribute('aria-expanded','true');
	    panel.setAttribute('aria-hidden','false');
	    // set explicit maxHeight for smooth transition
	    const full = panel.scrollHeight + 24;
	    panel.style.maxHeight = full + 'px';
	  }
	
	  function closeOthers(exceptBtn){
	    toggles.forEach(t=>{ if(t!==exceptBtn) closePanel(t); });
	  }
	
	  toggles.forEach(btn=>{
	    btn.addEventListener('click', ()=>{
	      const open = btn.getAttribute('aria-expanded') === 'true';
	      if(open) closePanel(btn);
	      else { closeOthers(btn); openPanel(btn); }
	    });
	
	    btn.addEventListener('keydown',(ev)=>{
	      const key = ev.key;
	      if(key==='Enter' || key===' '){ ev.preventDefault(); btn.click(); }
	      if(key==='ArrowDown' || key==='ArrowRight'){ ev.preventDefault(); const idx = toggles.indexOf(btn); toggles[(idx+1)%toggles.length].focus(); }
	      if(key==='ArrowUp' || key==='ArrowLeft'){ ev.preventDefault(); const idx = toggles.indexOf(btn); toggles[(idx-1+toggles.length)%toggles.length].focus(); }
	    });
	  });
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
		const mapToEN = { 'index.html':'index.html', 'casos.html':'cases.html', 'contacto.html':'contact.html', 'privacy.html':'privacy.html', 'terms.html':'terms.html' };
		const mapToES = { 'index.html':'index.html', 'cases.html':'casos.html', 'contact.html':'contacto.html', 'privacy.html':'privacy.html', 'terms.html':'terms.html' };
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
