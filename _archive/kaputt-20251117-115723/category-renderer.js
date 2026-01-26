(function(){
	const GRID_SELECTOR = '.music-grid';
	const PAGE_PATH = window.location.pathname;
	const DIRNAME = PAGE_PATH.replace(/\/[^\/]*$/, '') || '';
	const SHARE_BASE_URL = `${window.location.origin}${DIRNAME}/index.html`;
	const urlParams = new URLSearchParams(window.location.search);
	const highlightSongId = urlParams.get('song');

	let highlightDone = false;
	let masterList = [];
	let gridEl = null;

	function getGrid(){
		if (!gridEl) {
			gridEl = document.querySelector(GRID_SELECTOR);
		}
		return gridEl;
	}

	function createEl(tag, attrs = {}, children = []){
		const el = document.createElement(tag);
		for (const [k, v] of Object.entries(attrs)) {
			if (k === 'class') {
				el.className = v;
			} else if (k === 'html') {
				el.innerHTML = v;
			} else {
				el.setAttribute(k, v);
			}
		}
		for (const child of children) {
			if (typeof child === 'string') {
				el.appendChild(document.createTextNode(child));
			} else if (child) {
				el.appendChild(child);
			}
		}
		return el;
	}

	function renderEmptyState(message){
		const grid = getGrid();
		if (!grid) return;
		grid.innerHTML = '<div class="card" style="padding:1.5rem; text-align:center;"><p class="txt-dim">' + (message || 'Noch keine Songs in dieser Kategorie.') + '</p></div>';
	}

	function buildAudioSources(audioFile, preferredFolder){
		const sources = [];
		if (preferredFolder) {
			sources.push(`../${preferredFolder}/${audioFile}`);
		}
		sources.push(`../Musik/audio/rapp/${audioFile}`);
		sources.push(`../Musik/audio/party/${audioFile}`);
		sources.push(`../Musik/audio/love/${audioFile}`);
		sources.push(`../Musik/audio/traurig/${audioFile}`);
		sources.push(`../Musik/audio/gemischt/${audioFile}`);
		sources.push(`../Musik/audio/${audioFile}`);
		sources.push(`../Musik_beta/audio/${audioFile}`);
		sources.push(`../Musik/${audioFile}`);
		sources.push(`../assets/media/${audioFile}`);
		sources.push(`./${audioFile}`);
		return Array.from(new Set(sources));
	}

	function buildShareButtons(track){
		const shareUrl = `${SHARE_BASE_URL}?song=${encodeURIComponent(track.id)}`;
		const shareTitle = `Michael Ostermann – ${track.title}`;
		const encodedUrl = encodeURIComponent(shareUrl);
		const encodedTitle = encodeURIComponent(shareTitle);

		const wrapper = createEl('div', { class: 'share-buttons' });

		const nativeBtn = createEl('button', {
			type: 'button',
			class: 'share-button share-button--native',
			'data-share-native': '1',
			'data-share-url': shareUrl,
			'data-share-title': shareTitle
		}, ['Teilen']);

		const whatsapp = createEl('a', {
			class: 'share-button',
			href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
			target: '_blank',
			rel: 'noopener noreferrer',
			'aria-label': 'Über WhatsApp teilen'
		}, ['WhatsApp']);

		const facebook = createEl('a', {
			class: 'share-button',
			href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
			target: '_blank',
			rel: 'noopener noreferrer',
			'aria-label': 'Auf Facebook teilen'
		}, ['Facebook']);

		const xshare = createEl('a', {
			class: 'share-button',
			href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
			target: '_blank',
			rel: 'noopener noreferrer',
			'aria-label': 'Auf X teilen'
		}, ['X']);

		const copy = createEl('button', {
			type: 'button',
			class: 'share-button share-button--copy',
			'data-share-copy': shareUrl
		}, ['Link kopieren']);

		wrapper.appendChild(nativeBtn);
		wrapper.appendChild(whatsapp);
		wrapper.appendChild(facebook);
		wrapper.appendChild(xshare);
		wrapper.appendChild(copy);

		return wrapper;
	}

	function buildCommentsSection(track){
		const wrapper = createEl('div', { class: 'music-comments', 'data-comments-root': track.id });
		const toggle = createEl('button', {
			type: 'button',
			class: 'music-comments__toggle',
			'data-comments-toggle': track.id,
			'aria-expanded': 'false'
		}, ['💬 Kommentare anzeigen']);

		const panel = createEl('div', {
			class: 'music-comments__panel',
			'data-comments-panel': track.id,
			'aria-hidden': 'true'
		});

		const list = createEl('ul', {
			class: 'music-comments__list',
			'data-comments-list': track.id
		});

		const empty = createEl('p', {
			class: 'music-comments__empty',
			'data-comments-empty': track.id
		}, ['Noch keine Kommentare vorhanden.']);

		const status = createEl('p', {
			class: 'music-comments__status',
			'data-comments-status': track.id,
			style: 'display:none;'
		});

		const error = createEl('p', {
			class: 'music-comments__status music-comments__status--error',
			'data-comments-error': track.id,
			style: 'display:none;'
		});

		const form = createEl('form', {
			class: 'music-comments__form',
			'data-comments-form': track.id
		}, [
			createEl('div', {}, [
				createEl('label', { class: 'sr-only', for: `commentName-${track.id}` }, ['Name']),
				createEl('input', {
					type: 'text',
					id: `commentName-${track.id}`,
					name: 'name',
					class: 'music-comments__input',
					placeholder: 'Dein Name',
					required: '',
					maxlength: '60'
				})
			]),
			createEl('div', {}, [
				createEl('label', { class: 'sr-only', for: `commentText-${track.id}` }, ['Kommentar']),
				createEl('textarea', {
					id: `commentText-${track.id}`,
					name: 'message',
					class: 'music-comments__textarea',
					placeholder: 'Dein Kommentar...',
					required: '',
					rows: '4',
					maxlength: '800'
				})
			]),
			createEl('p', { class: 'music-comments__hint' }, ['Dein Kommentar wird nach Prüfung freigeschaltet.']),
			createEl('button', { type: 'submit', class: 'btn btn--neon' }, ['Kommentar senden'])
		]);

		panel.appendChild(list);
		panel.appendChild(empty);
		panel.appendChild(status);
		panel.appendChild(error);
		panel.appendChild(form);

		wrapper.appendChild(toggle);
		wrapper.appendChild(panel);
		return wrapper;
	}

	function buildCard(track){
		const article = createEl('article', {
			class: 'card card--track music-card',
			style: 'opacity: 1; visibility: visible;',
			'data-song-id': track.id
		});
		const coverFile = track.cover && typeof track.cover === 'string' && track.cover.trim() !== '' ? track.cover : 'cover-default.svg';
		const coverSrc = coverFile.startsWith('covers/') ? `./${coverFile}` : `../assets/media/${coverFile}`;
		const img = createEl('img', { class: 'card__media music-card-image', src: coverSrc, alt: `${track.title} Cover`, loading: 'lazy' });
		const body = createEl('div', { class: 'card__body' });

		body.appendChild(createEl('h3', { class: 'card__title' }, [track.title]));

		const descText = track.description && track.description.trim() !== '' ? track.description : '';
		body.appendChild(createEl('p', { class: 'card__text txt-dim', style: 'margin-top: 0.5rem; font-size: 0.9rem;' }, [descText]));

		if(track.isNew){
			body.appendChild(createEl('div', { class: 'badge badge--new', 'aria-label': 'Neu' }, ['Neu']));
		}

		const audio = createEl('audio', { class: 'card__player music-player', controls: '', preload: 'metadata' });
		for(const src of buildAudioSources(track.audio, track.folder)){
			audio.appendChild(createEl('source', { src, type: 'audio/mpeg' }));
		}
		audio.appendChild(document.createTextNode('Dein Browser unterstützt das Audio-Element nicht.'));
		body.appendChild(audio);

		const rating = createEl('div', { class: 'rating-widget', 'data-song-id': track.id }, [
			createEl('div', { class: 'rating-stars' }, [
				'⭐','⭐','⭐','⭐','⭐'
			].map(s => createEl('span', { class: 'rating-star' }, [s]))),
			createEl('div', { class: 'rating-info' }, [
				createEl('span', { class: 'rating-average' }, ['0.0']),
				createEl('span', { class: 'rating-count' }, ['(0 Bewertungen)'])
			])
		]);
		body.appendChild(rating);

		const actions = createEl('div', { class: 'card__actions' });
		const downloadBase = track.folder ? `../${track.folder}` : '../Musik/audio';
		const downloadHref = `${downloadBase}/${track.audio}`;
		const downloadName = `Michael Ostermann - ${track.title}.mp3`;
		const download = createEl('a', { class: 'btn btn--glass btn-download', href: downloadHref, download: downloadName }, ['Download']);
		actions.appendChild(download);
		body.appendChild(actions);

		body.appendChild(buildShareButtons(track));
		body.appendChild(buildCommentsSection(track));

		article.appendChild(img);
		article.appendChild(body);
		return article;
	}

	function initShareButtons(root){
		const nativeButtons = root.querySelectorAll('[data-share-native]');
		nativeButtons.forEach(btn => {
			if (btn.dataset.bound === '1') return;
			btn.dataset.bound = '1';
			btn.addEventListener('click', async () => {
				const shareUrl = btn.getAttribute('data-share-url') || '';
				const shareTitle = btn.getAttribute('data-share-title') || 'Song teilen';
				if (navigator.share) {
					try {
						await navigator.share({ title: shareTitle, url: shareUrl });
					} catch (err) {
						if (err && err.name !== 'AbortError') {
							console.warn('Native share fehlgeschlagen:', err);
							alert('Teilen nicht möglich.');
						}
					}
				} else {
					tryCopyToClipboard(shareUrl);
				}
			});
		});

		const copyButtons = root.querySelectorAll('[data-share-copy]');
		copyButtons.forEach(btn => {
			if (btn.dataset.bound === '1') return;
			btn.dataset.bound = '1';
			btn.addEventListener('click', () => {
				const link = btn.getAttribute('data-share-copy') || '';
				tryCopyToClipboard(link);
			});
		});
	}

	async function tryCopyToClipboard(text){
		if (!text) return;
		try {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(text);
				alert('Link kopiert!');
			} else {
				const ok = window.prompt('Link kopieren und mit STRG+C bestätigen:', text);
				if (ok !== null) {
					alert('Link kopiert!');
				}
			}
		} catch (err) {
			console.warn('Clipboard fehlgeschlagen:', err);
			window.prompt('Link kopieren und mit STRG+C bestätigen:', text);
		}
	}

	function tryHighlight(){
		if (highlightDone || !highlightSongId) return;
		const grid = getGrid();
		if (!grid) return;
		const safeId = (typeof CSS !== 'undefined' && CSS.escape) ? CSS.escape(highlightSongId) : highlightSongId;
		const card = grid.querySelector(`[data-song-id="${safeId}"]`);
		if (card) {
			highlightDone = true;
			card.classList.add('card--highlight');
			card.scrollIntoView({ behavior: 'smooth', block: 'center' });
			setTimeout(() => card.classList.remove('card--highlight'), 3500);
		}
	}

	function renderList(list, { searchMessage } = {}){
		const grid = getGrid();
		if (!grid) return;

		if (!list.length) {
			renderEmptyState(searchMessage || 'Noch keine Songs in dieser Kategorie.');
			return;
		}

		grid.innerHTML = '';
		for (const track of list) {
			grid.appendChild(buildCard(track));
		}

		initShareButtons(grid);
		if (window.commentsManager && typeof window.commentsManager.register === 'function') {
			window.commentsManager.register(grid);
		}
		tryHighlight();

		if (typeof window !== 'undefined') {
			if (typeof window.initRatingSystem === 'function') {
				try { window.initRatingSystem(); } catch (e) { console.warn('initRatingSystem() Fehler:', e); }
			} else if (window.dispatchEvent) {
				window.dispatchEvent(new CustomEvent('tracks:rendered'));
			}
		}
	}

	function setupSearch(){
		const input = document.querySelector('.music-search');
		if (!input || input.dataset.bound === '1') return;
		input.dataset.bound = '1';
		input.addEventListener('input', e => {
			const term = e.target.value || '';
			applySearchFilter(term);
		});
	}

	function applySearchFilter(term){
		const query = (term || '').toLowerCase().trim();
		if (!query) {
			renderList(masterList);
			return;
		}
		const filtered = masterList.filter(track => {
			const pool = [
				track.title || '',
				track.description || '',
				track.category || ''
			].join(' ').toLowerCase();
			return pool.includes(query);
		});
		renderList(filtered, { searchMessage: `Keine Treffer für "${term}".` });
	}

	async function renderCategory(categoryJsonPath){
		const grid = getGrid();
		if (!grid) return;

		const categoryMatch = categoryJsonPath.match(/\/?([a-zA-Z0-9_-]+)\.json/i);
		const categorySlug = categoryMatch ? categoryMatch[1].toLowerCase() : '';
		let list = [];

		try {
			const res = await fetch(`${categoryJsonPath}?v=${Date.now()}`, { cache: 'no-cache' });
			if (res.ok) {
				const data = await res.json();
				list = Array.isArray(data?.tracks) ? data.tracks : [];
			}
		} catch (err) {
			console.error('Fehler beim Laden:', err);
		}

		if (!list.length && categorySlug) {
			const fallbackUrls = Array.from(new Set([
				`${DIRNAME}/tracks.json`,
				'/Musik/tracks.json',
				'/Musik_beta/tracks.json'
			]));
			for (const url of fallbackUrls) {
				try {
					const resTracks = await fetch(url + '?v=' + Date.now(), { cache: 'no-cache' });
					if (!resTracks.ok) continue;
					const payload = await resTracks.json();
					const tracks = Array.isArray(payload?.tracks) ? payload.tracks : [];
					if (tracks.length) {
						list = tracks.filter(t => (t.category || '').toLowerCase() === categorySlug);
						if (list.length) break;
					}
				} catch (err) {
					console.warn('Fallback tracks.json fehlgeschlagen:', err);
				}
			}
		}

		if (!list.length) {
			renderEmptyState('Noch keine Songs in dieser Kategorie.');
			return;
		}

		masterList = list;
		setupSearch();
		const searchInput = document.querySelector('.music-search');
		const initialQuery = searchInput ? (searchInput.value || '') : '';
		if (initialQuery.trim() !== '') {
			applySearchFilter(initialQuery);
		} else {
			renderList(masterList);
		}
	}

	async function deleteSong(songId, category) {
		let csrfToken = '';
		try {
			const tokenRes = await fetch('./csrf-token.php');
			const tokenData = await tokenRes.json();
			csrfToken = tokenData.token || '';
		} catch (e) {
			alert('Fehler beim Laden des CSRF-Tokens');
			return;
		}

		const formData = new FormData();
		formData.append('songId', songId);
		formData.append('category', category);
		formData.append('csrf', csrfToken);

		try {
			const res = await fetch('./delete.php', {
				method: 'POST',
				body: formData
			});
			const data = await res.json();
			if (data.success) {
				alert('Song erfolgreich gelöscht!');
				window.location.reload();
			} else {
				alert('Fehler beim Löschen: ' + (data.error || 'Unbekannter Fehler'));
			}
		} catch (e) {
			alert('Fehler beim Löschen: ' + e.message);
		}
	}

	window.renderCategory = renderCategory;
	window.deleteSong = deleteSong;
})();
