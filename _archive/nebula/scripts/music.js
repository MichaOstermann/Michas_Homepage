const libraryGrid = document.getElementById("library-grid");
const uploadForm = document.getElementById("upload-form");
const uploadMessage = uploadForm ? uploadForm.querySelector(".form-success") : null;

const AUDIO_BLOOM =
  "data:audio/wav;base64,UklGRkQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YUA4AAAAAAD///8AAP///wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA";
const AUDIO_GLYPH =
  "data:audio/wav;base64,UklGRkQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YUA4AAAAAAAAgP8AAP//AACg/wAA4P8AAOD/AADw/wAA8P8AAPD/AADw/wAA8P8AAPD/AADg/wAA4P8AAMj/AADY/wAAvP8AALz/AAC4/wAAtP8AAKz/AACo/wAA";
const AUDIO_VANTA =
  "data:audio/wav;base64,UklGRkQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YUA4AAAAAACA/wAA4P8AAPD/AAD4/wAA/P8AAP7/AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA";

const CODE_PRESET =
  "data:text/plain;base64,UGhvdG9uIFN5bmM6IHdlbGNvbWUgdG8gdGhlIHBsYXRlaW5nIGFyZW5hIG9mIFN0dWRpbyBOZWJ1bGEuIExvYWRcdGVzdCB0aGUgYWN0aW9uIGFuZCByZWNvcmQgeW91ciBwYXJhbWV0ZXMu";
const CODE_ACTIONS =
  "data:text/plain;base64,LyoKIENvZGU6IEdseXBoIFJ1bm5lciBBY3Rpb24gQmx1ZQogVGhpcyBpcyBhIHBsYWNlaG9sZGVyIGZpbGUuCiov";
const CODE_TOOLKIT =
  "data:text/plain;base64,LyoKIENvZGU6IFZhbnRhIEJsb29tIHRvb2xraXQKIC0gRGVwZW5kZW5jaWVzOiBTdWRpbyBOZWJ1bGEgLS8KIyBGaWxsIG1pdCBkZWluZW4gTW9kdWxlbi4KKi8=";

const sampleLibrary = [
  {
    id: "orbit-bloom",
    title: "Orbit Bloom",
    description:
      "Nebelartige Pads, resonante Percussion und Motion-Presets für eine EP, die aus Biolumineszenz-Inspiration entstand.",
    tags: ["Hyper Chillwave", "122 BPM", "E minor"],
    audio: AUDIO_BLOOM,
    downloads: [
      { label: "Audio Preview", href: AUDIO_BLOOM, filename: "orbit-bloom-preview.wav" },
      { label: "Photon Script", href: CODE_PRESET, filename: "orbit-bloom-photon.txt" },
    ],
  },
  {
    id: "glyph-runner",
    title: "Glyph Runner (Live Cut)",
    description:
      "Auszug aus einer Live Coding Session – glitchige Arps, polymetrische Drum-Slots plus PS Actions für Runic Visuals.",
    tags: ["Live Coding", "140 BPM", "B Dorian"],
    audio: AUDIO_GLYPH,
    downloads: [
      { label: "Audio Preview", href: AUDIO_GLYPH, filename: "glyph-runner-cut.wav" },
      { label: "Action Stack", href: CODE_ACTIONS, filename: "glyph-runner-actions.txt" },
    ],
  },
  {
    id: "vanta-bloom",
    title: "Vanta Bloom",
    description:
      "Audio Branding für ein Tech-Kollektiv: dunkle Subharmoniken, modulierte Noise Beds und adaptive UI-Sounds.",
    tags: ["Brand Score", "98 BPM", "C# minor"],
    audio: AUDIO_VANTA,
    downloads: [
      { label: "Audio Preview", href: AUDIO_VANTA, filename: "vanta-bloom-id.wav" },
      { label: "Toolkit Notes", href: CODE_TOOLKIT, filename: "vanta-bloom-toolkit.txt" },
    ],
  },
];

function getRating(id) {
  const stored = localStorage.getItem(`nebula-rating:${id}`);
  return stored ? Number(stored) : 0;
}

function setRating(id, value) {
  localStorage.setItem(`nebula-rating:${id}`, String(value));
}

function createRating(id) {
  const wrapper = document.createElement("div");
  wrapper.className = "rating";
  wrapper.setAttribute("role", "radiogroup");
  wrapper.setAttribute("aria-label", "Sterne Bewertung");

  const current = getRating(id);

  for (let value = 1; value <= 5; value += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "★";
    button.setAttribute("role", "radio");
    button.setAttribute("aria-label", `${value} Sterne`);
    button.setAttribute("aria-checked", value === current ? "true" : "false");
    if (value <= current) button.classList.add("active");

    button.addEventListener("click", () => {
      setRating(id, value);
      updateRating(wrapper, value);
    });

    wrapper.appendChild(button);
  }

  const label = document.createElement("span");
  label.dataset.role = "rating-label";
  label.textContent = current ? `${current} / 5` : "Bewerte";
  wrapper.appendChild(label);

  return wrapper;
}

function updateRating(wrapper, value) {
  wrapper.querySelectorAll("button").forEach((button, index) => {
    const starValue = index + 1;
    const isActive = starValue <= value;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-checked", starValue === value ? "true" : "false");
  });

  const label = wrapper.querySelector('[data-role="rating-label"]');
  if (label) label.textContent = value ? `${value} / 5` : "Bewerte";
}

function createDownloads(downloads) {
  const row = document.createElement("div");
  row.className = "download-row";

  downloads.forEach((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.download = item.filename;
    link.textContent = item.label;
    row.appendChild(link);
  });

  return row;
}

function createCard(item) {
  const card = document.createElement("article");
  card.className = "archive-card";

  const header = document.createElement("header");
  const title = document.createElement("h2");
  title.textContent = item.title;
  const description = document.createElement("p");
  description.textContent = item.description;
  header.append(title, description);

  const meta = document.createElement("div");
  meta.className = "archive-card__meta";
  item.tags.forEach((tag) => {
    const badge = document.createElement("span");
    badge.textContent = tag;
    meta.appendChild(badge);
  });

  const player = document.createElement("div");
  player.className = "archive-card__player";
  player.innerHTML = `
    <strong>Preview</strong>
    <audio controls preload="none" src="${item.audio}">
      Dein Browser unterstützt kein HTML5 Audio.
    </audio>
  `;

  card.append(header, meta, player, createDownloads(item.downloads), createRating(item.id));
  return card;
}

function renderLibrary() {
  if (!libraryGrid) return;
  libraryGrid.innerHTML = "";
  sampleLibrary.forEach((item) => libraryGrid.appendChild(createCard(item)));
}

function handleUploadSubmit(event) {
  event.preventDefault();
  if (!uploadForm || !uploadMessage) return;

  const data = new FormData(uploadForm);
  const title = data.get("title") || "Unbenannt";
  uploadMessage.textContent = `Upload für "${title}" wurde lokal simuliert. Assets können jetzt manuell ersetzt werden.`;

  console.group("Upload Simulation · Studio Nebula");
  console.log("Titel:", data.get("title"));
  console.log("Genre:", data.get("genre"));
  console.log("BPM:", data.get("bpm"));
  console.log("Key:", data.get("key"));
  console.log("Beschreibung:", data.get("description"));
  console.log("Audio:", data.get("audio")?.name);
  console.log("Artwork:", data.get("artwork")?.name);
  console.log("PS Code:", data.get("code")?.name);
  console.log("AI Draft:", data.get("aiCopy") === "on" ? "aktiv" : "aus");
  console.groupEnd();

  uploadForm.reset();
}

renderLibrary();

if (uploadForm) {
  uploadForm.addEventListener("submit", handleUploadSubmit);
}

