(function(){
	const dirPath = window.location.pathname.replace(/\/[^\/]*$/, '');
	const API_URL = `${dirPath}/comments.php`;

	function qsAll(root, selector){
		return Array.from(root.querySelectorAll(selector));
	}

	function sanitize(str){
		return typeof str === 'string' ? str.trim() : '';
	}

	function formatDate(iso){
		if (!iso) return '';
		const date = new Date(iso);
		if (Number.isNaN(date.getTime())) return '';
		return date.toLocaleString('de-DE', {
			dateStyle: 'short',
			timeStyle: 'short'
		});
	}

	class CommentsManager {
		constructor(){
			this.loaded = new Set();
			this.register(document);
		}

		register(root){
			qsAll(root, '[data-comments-toggle]').forEach(toggle => this.bindToggle(toggle));
			qsAll(root, '[data-comments-form]').forEach(form => this.bindForm(form));
		}

		bindToggle(toggle){
			if (toggle.dataset.bound === '1') return;
			toggle.dataset.bound = '1';
			toggle.addEventListener('click', () => {
				const songId = toggle.getAttribute('data-comments-toggle');
				const panel = document.querySelector(`[data-comments-panel="${songId}"]`);
				if (!panel) return;
				const isVisible = panel.classList.contains('is-visible');
				panel.classList.toggle('is-visible');
				panel.setAttribute('aria-hidden', String(isVisible));
				toggle.setAttribute('aria-expanded', String(!isVisible));
				if (!isVisible && !this.loaded.has(songId)) {
					this.fetchComments(songId);
				}
			});
		}

		bindForm(form){
			if (form.dataset.bound === '1') return;
			form.dataset.bound = '1';
			form.addEventListener('submit', (event) => {
				event.preventDefault();
				const songId = form.getAttribute('data-comments-form');
				const name = sanitize(form.querySelector('input[name="name"]').value);
				const message = sanitize(form.querySelector('textarea[name="message"]').value);
				if (name.length < 2 || message.length < 5) {
					this.showError(songId, 'Bitte gib einen gültigen Namen und Kommentar ein.');
					return;
				}
				this.submitComment(songId, name, message, form);
			});
		}

		async fetchComments(songId){
			this.setLoading(songId, true);
			try {
				const res = await fetch(`${API_URL}?song=${encodeURIComponent(songId)}&v=${Date.now()}`, {
					headers: { 'Accept': 'application/json' }
				});
				if (!res.ok) throw new Error('Netzwerkfehler');
				const data = await res.json();
				if (!data.success) throw new Error(data.error || 'Fehler beim Laden');
				this.renderComments(songId, Array.isArray(data.comments) ? data.comments : []);
				this.loaded.add(songId);
			} catch (err) {
				this.showError(songId, 'Kommentare konnten nicht geladen werden.');
				console.warn('Kommentare Fehler:', err);
			} finally {
				this.setLoading(songId, false);
			}
		}

		renderComments(songId, comments){
			const list = document.querySelector(`[data-comments-list="${songId}"]`);
			const empty = document.querySelector(`[data-comments-empty="${songId}"]`);
			if (!list || !empty) return;

			if (!comments.length) {
				list.innerHTML = '';
				empty.style.display = 'block';
				return;
			}

			empty.style.display = 'none';
			list.innerHTML = comments.map(comment => {
				const name = sanitize(comment.name) || 'Anonym';
				const date = formatDate(comment.createdAt);
				const text = sanitize(comment.message);
				return `<li class="music-comments__item">
					<div class="music-comments__meta">
						<span>${name}</span>
						<span>${date}</span>
					</div>
					<p class="music-comments__text">${text.replace(/\n/g, '<br>')}</p>
				</li>`;
			}).join('');
		}

		async submitComment(songId, name, message, form){
			const statusEl = document.querySelector(`[data-comments-status="${songId}"]`);
			const errorEl = document.querySelector(`[data-comments-error="${songId}"]`);
			if (statusEl) {
				statusEl.style.display = 'none';
				statusEl.textContent = '';
			}
			if (errorEl) {
				errorEl.style.display = 'none';
				errorEl.textContent = '';
			}

			const submitBtn = form.querySelector('button[type="submit"]');
			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.textContent = 'Senden...';
			}

			try {
				const res = await fetch(API_URL, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ songId, name, message })
				});
				const data = await res.json();
				if (!res.ok || !data.success) {
					throw new Error(data.error || 'Fehler beim Speichern');
				}

				if (form) {
					form.reset();
				}
				if (statusEl) {
					statusEl.textContent = 'Danke! Dein Kommentar wird nach Prüfung freigeschaltet.';
					statusEl.style.display = 'block';
				}
			} catch (err) {
				console.warn('Kommentar speichern Fehler:', err);
				this.showError(songId, err.message || 'Kommentar konnte nicht gespeichert werden.');
			} finally {
				if (submitBtn) {
					submitBtn.disabled = false;
					submitBtn.textContent = 'Kommentar senden';
				}
			}
		}

		setLoading(songId, isLoading){
			const list = document.querySelector(`[data-comments-list="${songId}"]`);
			if (!list) return;
			if (isLoading) {
				list.innerHTML = '<li class="music-comments__item">Lade Kommentare...</li>';
			}
		}

		showError(songId, message){
			const errorEl = document.querySelector(`[data-comments-error="${songId}"]`);
			if (!errorEl) return;
			errorEl.textContent = message;
			errorEl.style.display = 'block';
		}
	}

	document.addEventListener('DOMContentLoaded', () => {
		window.commentsManager = new CommentsManager();
	});
})();

