(() => {
    const body = document.body;
    body.classList.remove('no-js');

    const selectors = {
        header: '.site-header',
        navToggle: '.nav-toggle',
        nav: '.site-nav',
        cookieBanner: '.cookie-banner',
        cookieAccept: '[data-cookie-accept]',
        cookieDecline: '[data-cookie-decline]',
        cookieSettings: '.cookie-settings',
        analyticsToggle: 'input[name="analytics"]',
        newsletterForm: '[data-newsletter]',
        contactForm: '#contact-form',
        formSuccess: '.form-success',
    };

    const storageKeys = {
        consent: 'codebeats_consent',
    };

    const state = {
        analyticsEnabled: false,
    };

    function $(selector, scope = document) {
        return scope.querySelector(selector);
    }

    function $$(selector, scope = document) {
        return Array.from(scope.querySelectorAll(selector));
    }

    function toggleHeaderShadow() {
        const header = $(selectors.header);
        if (!header) return;
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        header.dataset.scrollState = scrollY > 12 ? 'scrolled' : 'top';
    }

    function handleNavigation() {
        const navToggle = $(selectors.navToggle);
        const nav = $(selectors.nav);
        if (!navToggle || !nav) return;

        navToggle.setAttribute('aria-expanded', 'false');
        nav.setAttribute('aria-expanded', 'false');

        navToggle.addEventListener('click', () => {
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
            nav.setAttribute('aria-expanded', String(!expanded));
        });

        nav.addEventListener('click', (event) => {
            if (event.target instanceof HTMLElement && event.target.tagName === 'A') {
                navToggle.setAttribute('aria-expanded', 'false');
                nav.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                navToggle.setAttribute('aria-expanded', 'false');
                nav.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function readConsent() {
        try {
            const stored = window.localStorage.getItem(storageKeys.consent);
            if (!stored) return null;
            return JSON.parse(stored);
        } catch (error) {
            console.warn('Consent konnte nicht gelesen werden.', error);
            return null;
        }
    }

    function saveConsent(consent) {
        try {
            window.localStorage.setItem(storageKeys.consent, JSON.stringify(consent));
        } catch (error) {
            console.warn('Consent konnte nicht gespeichert werden.', error);
        }
    }

    function startAnalytics() {
        if (state.analyticsEnabled) {
            return;
        }
        state.analyticsEnabled = true;
        console.info('Analytics aktiviert (lokal, anonymisiert).');
        // Platz für lokales Tracking ohne Drittanbieter
    }

    function stopAnalytics() {
        if (!state.analyticsEnabled) {
            return;
        }
        state.analyticsEnabled = false;
        console.info('Analytics deaktiviert.');
    }

    function applyConsent(consent, banner) {
        saveConsent(consent);
        if (banner) {
            banner.hidden = true;
        }

        if (consent.analytics) {
            startAnalytics();
        } else {
            stopAnalytics();
        }
    }

    function setupCookieBanner() {
        const banner = $(selectors.cookieBanner);
        if (!banner) return;
        const acceptButton = $(selectors.cookieAccept, banner);
        const declineButton = $(selectors.cookieDecline, banner);
        const analyticsToggle = $(selectors.analyticsToggle, banner);
        const settingButtons = $$(selectors.cookieSettings);

        const storedConsent = readConsent();
        if (!storedConsent) {
            banner.hidden = false;
        } else {
            if (storedConsent.analytics) {
                startAnalytics();
            }
        }

        if (analyticsToggle && storedConsent) {
            analyticsToggle.checked = Boolean(storedConsent.analytics);
        }

        acceptButton?.addEventListener('click', () => {
            const analytics =
                analyticsToggle instanceof HTMLInputElement ? analyticsToggle.checked : false;
            applyConsent({ essential: true, analytics }, banner);
        });

        declineButton?.addEventListener('click', () => {
            if (analyticsToggle instanceof HTMLInputElement) {
                analyticsToggle.checked = false;
            }
            applyConsent({ essential: true, analytics: false }, banner);
        });

        settingButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const consent = readConsent();
                if (analyticsToggle) {
                    analyticsToggle.checked = Boolean(consent?.analytics);
                }
                banner.hidden = false;
                banner.focus?.();
            });
        });
    }

    function validateField(field) {
        if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
            return true;
        }
        const container = field.closest('.form-field') || field.parentElement;
        const errorElement = container?.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }

        if (!field.checkValidity()) {
            let message = field.validationMessage;
            if (field.validity.valueMissing) {
                message = 'Dieses Feld ist erforderlich.';
            } else if (field.validity.typeMismatch) {
                message = 'Bitte geben Sie eine gültige Eingabe ein.';
            } else if (field.validity.patternMismatch) {
                message = 'Das Format stimmt nicht.';
            }
            if (errorElement) {
                errorElement.textContent = message;
            } else {
                field.setAttribute('aria-invalid', 'true');
            }
            return false;
        }

        field.removeAttribute('aria-invalid');
        return true;
    }

    function validateForm(form) {
        const fields = Array.from(form.elements).filter(
            (el) =>
                el instanceof HTMLInputElement ||
                el instanceof HTMLTextAreaElement ||
                el instanceof HTMLSelectElement
        );
        let isValid = true;
        fields.forEach((field) => {
            const result = validateField(field);
            if (!result) {
                isValid = false;
            }
        });
        return isValid;
    }

    function setupContactForm() {
        const form = document.querySelector(selectors.contactForm);
        if (!form) return;

        const successMessage = $(selectors.formSuccess, form);
        form.addEventListener('input', (event) => {
            if (!(event.target instanceof HTMLElement)) return;
            validateField(event.target);
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!validateForm(form)) {
                form.querySelector('[aria-invalid="true"]')?.focus();
                return;
            }

            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());
            console.info('Kontaktformular gesendet (Demo):', payload);

            form.reset();
            if (successMessage) {
                successMessage.hidden = false;
                window.scrollTo({
                    top: form.offsetTop - 80,
                    behavior: 'smooth',
                });
            }
        });
    }

    function setupNewsletterForm() {
        const form = document.querySelector(selectors.newsletterForm);
        if (!form) return;

        const input = form.querySelector('input[type="email"]');
        const status = document.createElement('p');
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        status.className = 'form-success';
        status.hidden = true;
        status.textContent = 'Vielen Dank! Bitte bestätigen Sie Ihre Anmeldung über den Link in Ihrer E-Mail.';
        form.append(status);

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!(input instanceof HTMLInputElement)) return;

            if (!input.checkValidity()) {
                input.reportValidity();
                return;
            }

            console.info('Newsletter-Anmeldung (Demo):', input.value);
            status.hidden = false;
            input.value = '';
        });
    }

    function setCurrentYear() {
        const now = new Date();
        $$('[data-current-year]').forEach((node) => {
            node.textContent = String(now.getFullYear());
        });
    }

    function init() {
        toggleHeaderShadow();
        window.addEventListener('scroll', toggleHeaderShadow, { passive: true });
        handleNavigation();
        setupCookieBanner();
        setupContactForm();
        setupNewsletterForm();
        setCurrentYear();
    }

    document.addEventListener('DOMContentLoaded', init);
})();

