const contactForm = document.getElementById("contact-form");
const successNode = document.querySelector(".form-success");

const rules = {
  name(value) {
    if (!value.trim()) return "Bitte Namen angeben.";
    if (value.length < 2) return "Name sollte mindestens 2 Zeichen besitzen.";
    return "";
  },
  email(value) {
    if (!value.trim()) return "E-Mail fehlt.";
    const pattern = /^[\w-.]+@[\w-]+\.[a-z]{2,}$/i;
    return pattern.test(value) ? "" : "E-Mail Format prüfen.";
  },
  message(value) {
    if (!value.trim()) return "Beschreibe dein Projekt.";
    if (value.length < 20) return "Bitte gib mindestens 20 Zeichen an Kontext.";
    return "";
  },
};

function setError(field, message) {
  const node = document.querySelector(`.form-error[data-for="${field}"]`);
  if (node) {
    node.textContent = message;
  }
}

function clearErrors() {
  document.querySelectorAll(".form-error").forEach((node) => {
    node.textContent = "";
  });
  if (successNode) successNode.textContent = "";
}

function handleSubmit(event) {
  event.preventDefault();
  if (!contactForm) return;

  clearErrors();
  const data = new FormData(contactForm);
  let hasError = false;

  Object.entries(rules).forEach(([field, validate]) => {
    const message = validate(data.get(field) || "");
    if (message) {
      setError(field, message);
      hasError = true;
    }
  });

  if (hasError) return;

  if (successNode) {
    successNode.textContent = "Danke! Dein Briefing-Request ist lokal gespeichert. Du erhältst zeitnah Feedback.";
  }

  console.group("Kontaktformular · Studio Nebula");
  console.log("Name:", data.get("name"));
  console.log("E-Mail:", data.get("email"));
  console.log("Format:", data.get("format"));
  console.log("Wunsch-Start:", data.get("start"));
  console.log("Module:", data.getAll("module").join(", ") || "keine Auswahl");
  console.log("Nachricht:", data.get("message"));
  console.log("AI-Briefing:", data.get("briefing") === "on" ? "Ja" : "Nein");
  console.groupEnd();

  contactForm.reset();
}

if (contactForm) {
  contactForm.addEventListener("submit", handleSubmit);
}
const form = document.getElementById("contact-form");
const successMessage = document.querySelector(".form-success");

const validators = {
  name(value) {
    if (!value.trim()) return "Bitte Namen angeben.";
    if (value.length < 2) return "Name sollte mindestens 2 Zeichen haben.";
    return "";
  },
  email(value) {
    if (!value.trim()) return "E-Mail fehlt.";
    const pattern = /^[\\w-.]+@[\\w-]+\\.[a-z]{2,}$/i;
    if (!pattern.test(value)) return "Bitte eine gültige E-Mail eintragen.";
    return "";
  },
  message(value) {
    if (!value.trim()) return "Nachricht darf nicht leer sein.";
    if (value.length < 15) return "Bitte mehr Kontext geben (mindestens 15 Zeichen).";
    return "";
  },
};

function setError(field, message) {
  const errorElement = document.querySelector(`.form-error[data-for="${field}"]`);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

function clearErrors() {
  document.querySelectorAll(".form-error").forEach((node) => {
    node.textContent = "";
  });
  if (successMessage) successMessage.textContent = "";
}

function handleSubmit(event) {
  event.preventDefault();
  if (!form) return;

  clearErrors();

  const formData = new FormData(form);
  let hasError = false;

  Object.entries(validators).forEach(([field, validate]) => {
    const error = validate(formData.get(field) || "");
    if (error) {
      setError(field, error);
      hasError = true;
    }
  });

  if (hasError) return;

  const projectTypes = formData.getAll("projectType");
  const aiBriefing = formData.get("briefing") === "on" ? "Ja" : "Nein";

  if (successMessage) {
    successMessage.textContent =
      "Danke! Deine Anfrage wurde lokal registriert. Prüfe den Posteingang für die manuelle Bestätigung.";
  }

  console.group("Kontakt Anfrage (Lokal)");
  console.log("Name:", formData.get("name"));
  console.log("E-Mail:", formData.get("email"));
  console.log("Kommunikation:", formData.get("channels"));
  console.log("Projekt-Fokus:", projectTypes.join(", ") || "keine Auswahl");
  console.log("Nachricht:", formData.get("message"));
  console.log("KI Briefing:", aiBriefing);
  console.groupEnd();

  form.reset();
}

if (form) {
  form.addEventListener("submit", handleSubmit);
}

