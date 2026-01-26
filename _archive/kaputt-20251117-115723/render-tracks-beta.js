(function(){
	const GRID_SELECTOR = '.music-grid';
	const PAGE_PATH = window.location.pathname;
	const DIRNAME = PAGE_PATH.replace(/\/[^\/]*$/, '') || '';
	const SHARE_BASE_URL = `${window.location.origin}${DIRNAME}/index.html`;

	const TRACKS_URLS = Array.from(new Set([
		`${DIRNAME}/tracks.json`,
		'/Musik/tracks.json',
		'/Musik_beta/tracks.json',
		'./tracks.json'
	]));

	const TRACKS_API_URLS = Array.from(new Set([
		`${DIRNAME}/tracks-api.php`,
		'/Musik/tracks-api.php',
		'/Musik_beta/tracks-api.php'
	]));
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
		for(const [k,v] of Object.entries(attrs)){
			if(k === 'class') {
				el.className = v;
			} else if(k === 'html') {
				el.innerHTML = v;
			} else {
				el.setAttribute(k, v);
			}
		}
		for(const c of children){
			if(typeof c === 'string') {
				el.appendChild(document.createTextNode(c));
			} else if (c) {
				el.appendChild(c);
			}
		}
		return el;
	}

	function renderEmptyState(message, { showUpload = true } = {}){
		const grid = getGrid();
		if(!grid) return;
		grid.innerHTML = '';
		const children = [
			createEl('h3', { class: 'card__title' }, ['Keine Songs gefunden']),
			createEl('p', { class: 'txt-dim', style: 'margin:.5rem 0 1rem;' }, [message || 'Lade deinen ersten Song hoch.'])
		];
		if (showUpload) {
			children.push(createEl('a', { class: 'btn btn--neon', href: './upload.php' }, ['+ Song hochladen']));
		}
		const box = createEl('div', {
			class: 'card',
			style: 'padding:1.25rem; text-align:center; border: 2px solid rgba(6,255,240,0.2); border-radius: 12px;'
		}, children);
		grid.appendChild(box);
	}

	function buildAudioSources(audioFile, preferredFolder){
		const sources = [];
		if (preferredFolder) {
			sources.push(`../${preferredFolder}/${audioFile}`);
		}
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
		}, ['Noch keine Kommentare vorhanden. Sei der Erste!']);

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
			createEl('p', { class: 'music-comments__hint' }, ['Dein Kommentar wird nach Prüfung freigeschaltet. Bitte freundlich bleiben.']),
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
		const category = (track.category || 'gemischt').toLowerCase().trim();
		const article = createEl('article', {
			class: 'card card--track music-card',
			'data-category': category,
			'data-song-id': track.id,
			style: 'opacity: 1; visibility: visible;'
		});
		const coverFile = track.cover && typeof track.cover === 'string' && track.cover.trim() !== '' ? track.cover : 'cover-default.svg';
		const coverSrc = coverFile.startsWith('covers/') ? `./${coverFile}` : `../assets/media/${coverFile}`;
		const img = createEl('img', { class: 'card__media music-card-image', src: coverSrc, alt: `${track.title} Cover`, loading: 'lazy' });
		const body = createEl('div', { class: 'card__body' });

		const h3 = createEl('h3', { class: 'card__title' }, [track.title]);
		body.appendChild(h3);

		const descText = track.description && track.description.trim() !== '' ? track.description : '';
		const p = createEl('p', { class: 'card__text txt-dim', style: 'margin-top: 0.5rem; font-size: 0.9rem;' }, [descText]);
		body.appendChild(p);

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
				// Fallback: Prompt
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
		const selector = `[data-song-id="${safeId}"]`;
		const card = grid.querySelector(selector);
		if (card) {
			highlightDone = true;
			card.classList.add('card--highlight');
			card.scrollIntoView({ behavior: 'smooth', block: 'center' });
			setTimeout(() => card.classList.remove('card--highlight'), 3500);
		}
	}

	function renderTracks(list, { emptyMessage, isSearch } = {}){
		const grid = getGrid();
		if (!grid) return;

		if (!list.length) {
			renderEmptyState(emptyMessage || 'Noch keine Songs im Beta-Bereich. Lade den ersten Track hoch.', { showUpload: !isSearch });
			if (typeof window !== 'undefined' && window.dispatchEvent) {
				window.dispatchEvent(new CustomEvent('tracks:rendered'));
			}
			return;
		}

		grid.innerHTML = '';
		for(const t of list){
			grid.appendChild(buildCard(t));
		}

		initShareButtons(grid);
		if (window.commentsManager && typeof window.commentsManager.register === 'function') {
			window.commentsManager.register(grid);
		}
		tryHighlight();

		if(typeof window !== 'undefined'){
			if(typeof window.initRatingSystem === 'function'){
				try { window.initRatingSystem(); } catch(e) { console.warn('initRatingSystem() Fehler:', e); }
			} else if(window.dispatchEvent){
				window.dispatchEvent(new CustomEvent('tracks:rendered'));
			}
		}
	}

	function setupSearch(){
		const input = document.querySelector('.music-search');
		if (!input || input.dataset.bound === '1') return;
		input.dataset.bound = '1';
		input.addEventListener('input', e => {
			applySearchFilter(e.target.value || '');
		});
	}

	function applySearchFilter(term){
		const query = (term || '').toLowerCase().trim();
		if (!query) {
			renderTracks(masterList);
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
		renderTracks(filtered, { emptyMessage: `Keine Treffer für "${term}".`, isSearch: true });
	}

	async function render(){
		let data;
		let usedApi = false;
		const cacheBuster = '?v=' + Date.now();

		for (let i = 0; i < TRACKS_URLS.length && !data; i++) {
			const baseUrl = TRACKS_URLS[i];
			const url = baseUrl + (baseUrl.includes('?') ? `&cb=${Date.now()}` : cacheBuster);
			try {
				const res = await fetch(url, { cache: 'no-cache' });
				if (res.ok) {
					data = await res.json();
					break;
				}
			} catch (_) {}
		}

		if (!data) {
			for (let i = 0; i < TRACKS_API_URLS.length && !data; i++) {
				try {
					const resApi = await fetch(TRACKS_API_URLS[i], { cache: 'no-cache' });
					if (resApi.ok) {
						data = await resApi.json();
						usedApi = TRACKS_API_URLS[i];
						break;
					}
				} catch (_) {}
			}
		}

		if (!data) {
			try {
				const res2 = await fetch('/assets/content/music.json', { cache: 'no-cache' });
				if (res2.ok) {
					const d2 = await res2.json();
					const list2 = Array.isArray(d2?.tracks) ? d2.tracks : [];
					data = list2.map((t, i) => {
						const audioPath = String(t.audio || '').replace(/^\/+/, '');
						const coverPath = String(t.cover || '').replace(/^\/+/, '');
						const audioFile = audioPath.split('/').pop() || `track${i+1}.mp3`;
						const coverFile = coverPath.split('/').pop() || 'cover-default.svg';
						return {
							id: `fallback-${i+1}`,
							title: t.title || `Track ${i+1}`,
							category: t.category || 'gemischt',
							description: t.description || '',
							cover: coverFile,
							audio: audioFile,
						folder: 'Musik/audio'
						};
					});
				}
			} catch (_) {}
		}

		const list = Array.isArray(data) ? data : (Array.isArray(data?.tracks) ? data.tracks : []);
		if (!list.length) {
			renderTracks([]);
			if (window.musicStats && typeof window.musicStats.update === 'function') {
				window.musicStats.update([]);
			}
			return;
		}

		masterList = list;
		if (window.musicStats && typeof window.musicStats.update === 'function') {
			window.musicStats.update(masterList);
		}
		setupSearch();

		const searchInput = document.querySelector('.music-search');
		const initialQuery = searchInput ? (searchInput.value || '') : '';
		if (initialQuery.trim() !== '') {
			applySearchFilter(initialQuery);
		} else {
			renderTracks(masterList);
		}

		if (usedApi) {
			try {
				const saveUrl = usedApi + (usedApi.includes('?') ? '&save=1' : '?save=1');
				fetch(saveUrl, { cache: 'no-cache' });
			} catch (_) {}
		}
	}

	if(document.readyState === 'loading'){
		document.addEventListener('DOMContentLoaded', render);
	} else {
		render();
	}
})();
