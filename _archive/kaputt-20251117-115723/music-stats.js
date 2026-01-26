(function(){
	const CATEGORY_LABELS = {
		party: 'Party',
		rapp: 'Rapp',
		love: 'Love',
		gemischt: 'Gemischt'
	};

	const DEFAULT_ORDER = ['party', 'rapp', 'love', 'gemischt'];

	function formatTimestamp(ts){
		try {
			const date = new Date(ts);
			if (Number.isNaN(date.getTime())) return null;
			return date;
		} catch {
			return null;
		}
	}

	function sanitizeText(value){
		return typeof value === 'string' ? value : '';
	}

	const stats = {
		root: null,
		elements: {},
		ratingCache: null,

		init(){
			this.root = document.querySelector('[data-music-stats]');
			if (!this.root) return;

			this.elements = {
				totalValue: this.root.querySelector('[data-stat-total-value]'),
				categoryList: this.root.querySelector('[data-stat-categories]'),
				topValue: this.root.querySelector('[data-stat-top-value]'),
				topFallback: this.root.querySelector('[data-stat-top-fallback]'),
				topList: this.root.querySelector('[data-stat-top-list]'),
				newBadge: this.root.querySelector('[data-stat-new-count]'),
				newList: this.root.querySelector('[data-stat-new-list]')
			};
		},

		async update(tracks){
			if (!this.root) return;
			if (!Array.isArray(tracks)) tracks = [];

			this.renderTotals(tracks);
			this.renderNewest(tracks);
			await this.renderTopRated(tracks);
		},

		renderTotals(tracks){
			const total = tracks.length;
			if (this.elements.totalValue) {
				this.elements.totalValue.innerHTML = `${total}<span>${total === 1 ? 'Song' : 'Songs'}</span>`;
			}

			if (!this.elements.categoryList) return;
			const counts = DEFAULT_ORDER.map(cat => {
				const count = tracks.filter(t => (t.category || '').toLowerCase() === cat).length;
				return { cat, count };
			});

			this.elements.categoryList.innerHTML = counts.map(({ cat, count }) => {
				return `<li class="music-stats__item"><span>${CATEGORY_LABELS[cat] || cat}</span><strong>${count}</strong></li>`;
			}).join('');
		},

		renderNewest(tracks){
			const listEl = this.elements.newList;
			const badgeEl = this.elements.newBadge;
			if (!listEl || !badgeEl) return;

			const enhanced = tracks.map(track => {
				const timestamp = formatTimestamp(track.uploadedAt || track.createdAt || track.timestamp);
				return {
					id: track.id,
					title: sanitizeText(track.title),
					category: sanitizeText(track.category).toLowerCase(),
					date: timestamp,
					isNew: Boolean(track.isNew)
				};
			});

			let newItems = enhanced.filter(t => t.isNew);
			if (!newItems.length) {
				newItems = enhanced
					.filter(t => t.date)
					.sort((a, b) => b.date - a.date)
					.slice(0, 5);
			}

		if (!newItems.length) {
				listEl.innerHTML = '<li class="music-stats__fallback">Noch keine Upload-Daten verfügbar.</li>';
				badgeEl.textContent = 'Neu';
				return;
			}

			badgeEl.textContent = `${newItems.length} Neu`;
			listEl.innerHTML = newItems.map(item => {
				const label = CATEGORY_LABELS[item.category] || item.category || 'Kategorie';
				let detail = label;
				if (item.date) {
					detail = `${label} · ${item.date.toLocaleDateString('de-DE')}`;
				}
				return `<li class="music-stats__item"><span>${sanitizeText(item.title)}</span><span>${detail}</span></li>`;
			}).join('');
		},

		async renderTopRated(tracks){
			const topListEl = this.elements.topList;
			const topValueEl = this.elements.topValue;
			const fallbackEl = this.elements.topFallback;

			if (!topListEl || !topValueEl || !fallbackEl) return;

			let ratingData = this.ratingCache;
			if (!ratingData) {
				ratingData = await this.fetchRatings();
				this.ratingCache = ratingData;
			}

			if (!ratingData) {
				topValueEl.innerHTML = '–<span>Ø Rating</span>';
				fallbackEl.style.display = 'block';
				topListEl.innerHTML = '';
				return;
			}

			const enriched = tracks.map(track => {
				const rating = ratingData[track.id];
				if (!rating) return null;
				const { total = 0, count = 0 } = rating;
				const average = count > 0 ? total / count : 0;
				return {
					id: track.id,
					title: sanitizeText(track.title),
					category: sanitizeText(track.category).toLowerCase(),
					average,
					count
				};
			}).filter(Boolean);

			if (!enriched.length) {
				topValueEl.innerHTML = '–<span>Ø Rating</span>';
				fallbackEl.style.display = 'block';
				topListEl.innerHTML = '<li class="music-stats__fallback">Noch keine Bewertungen vorhanden.</li>';
				return;
			}

			enriched.sort((a, b) => {
				if (b.average === a.average) return b.count - a.count;
				return b.average - a.average;
			});

			const top = enriched.slice(0, 3);
			const globalAverage = top.reduce((sum, item) => sum + item.average, 0) / top.length;

			topValueEl.innerHTML = `${globalAverage.toFixed(1)}<span>Ø (Top ${top.length})</span>`;
			fallbackEl.style.display = 'none';

			topListEl.innerHTML = top.map(item => {
				const label = CATEGORY_LABELS[item.category] || item.category || 'Kategorie';
				const avg = item.average.toFixed(1);
				return `<li class="music-stats__item">
					<span>${sanitizeText(item.title)}</span>
					<span class="music-stats__trend-up">${avg} ★ · ${item.count}</span>
				</li>`;
			}).join('');
		},

		async fetchRatings(){
			if (typeof firebase === 'undefined' || !firebase?.database) {
				return null;
			}
			try {
				const snapshot = await firebase.database().ref('ratings').once('value');
				return snapshot.val() || null;
			} catch (err) {
				console.warn('Konnte Ratings nicht laden:', err);
				return null;
			}
		}
	};

	document.addEventListener('DOMContentLoaded', () => stats.init());

	window.musicStats = {
		update: tracks => stats.update(tracks)
	};
})();


