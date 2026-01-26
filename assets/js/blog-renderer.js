(function () {
  var isInBlogDirectory = (window.location.pathname || "").indexOf("/blog/") !== -1;
  var DATA_URL = isInBlogDirectory
    ? "../assets/content/blog.json"
    : "assets/content/blog.json";

  var HIGHLIGHT_SELECTOR = "[data-blog-highlight]";
  var HIGHLIGHT_EMPTY_SELECTOR = "[data-blog-empty]";
  var LIST_SELECTOR = "[data-blog-list]";
  var LIST_EMPTY_SELECTOR = "[data-blog-list-empty]";
  var FILTER_SELECTOR = "[data-blog-filter]";
  var ALL_FILTER_VALUE = "all";
  var MAX_HIGHLIGHTS = 3;

  var TAG_GRADIENTS = {
    "Musik": "linear-gradient(135deg, rgba(6,255,240,0.22) 0%, rgba(139,92,246,0.22) 100%)",
    "News": "linear-gradient(135deg, rgba(200,0,0,0.22) 0%, rgba(34,139,34,0.22) 100%)",
    "Dev": "linear-gradient(135deg, rgba(139,92,246,0.20) 0%, rgba(6,255,240,0.20) 100%)"
  };

  var TAG_BADGES = {
    "Musik": { label: "Musik", emoji: "\uD83C\uDFB5" },
    "News": { label: "News", emoji: "\uD83D\uDCF0" },
    "Dev": { label: "Dev", emoji: "\u2699\uFE0F" }
  };

  var posts = [];
  var activeFilter = ALL_FILTER_VALUE;

  function isValidDate(value) {
    var time = Date.parse(value);
    return !isNaN(time) ? new Date(time) : new Date(0);
  }

  function normalisePosts(data) {
    if (!data || !Array.isArray(data.posts)) {
      return [];
    }

    return data.posts
      .map(function (item) {
        var tagMeta = TAG_BADGES[item.tag] || { label: item.tag || "News", emoji: "" };
        // Korrigiere href basierend auf dem aktuellen Pfad
        var href = item.href || "#";
        if (isInBlogDirectory && href.indexOf("blog/") === 0) {
          // Wenn wir in /blog/ sind und href mit "blog/" beginnt, entferne "blog/"
          href = href.substring(5);
        }
        return {
          slug: item.slug || "",
          href: href,
          title: item.title || "Unbenannter Beitrag",
          tag: item.tag || tagMeta.label,
          tagMeta: tagMeta,
          readMin: typeof item.readMin === "number" ? item.readMin : null,
          date: item.date || "1970-01-01",
          featured: Boolean(item.featured),
          excerpt: item.excerpt || "",
          emoji: item.emoji || tagMeta.emoji || "",
          gradient: TAG_GRADIENTS[item.tag] || TAG_GRADIENTS[tagMeta.label] || TAG_GRADIENTS.News
        };
      })
      .sort(function (a, b) {
        return isValidDate(b.date) - isValidDate(a.date);
      });
  }

  function clearContainer(selector, emptySelector) {
    var container = document.querySelector(selector);
    var emptyState = emptySelector ? document.querySelector(emptySelector) : null;
    if (!container) {
      return { container: null, emptyNode: null };
    }
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    if (emptyState) {
      emptyState.style.display = "none";
    }
    return { container: container, emptyNode: emptyState };
  }

  function createMetaBadge(text) {
    var span = document.createElement("span");
    span.className = "badge";
    span.textContent = text;
    return span;
  }

  function createCard(post, delay) {
    var article = document.createElement("article");
    article.className = "card blog-card reveal";
    article.setAttribute("data-delay", String(delay || 0));
    article.setAttribute("data-href", post.href);
    article.setAttribute("role", "link");
    article.setAttribute("tabindex", "0");
    article.setAttribute("aria-label", "Zum Beitrag: " + post.title);

    var media = document.createElement("div");
    media.className = "card__media";
    media.style.background = post.gradient;
    media.style.padding = "2rem";
    media.style.display = "flex";
    media.style.alignItems = "center";
    media.style.justifyContent = "center";
    media.style.minHeight = "200px";

    var emoji = document.createElement("div");
    emoji.textContent = post.emoji || post.tagMeta.emoji || "\u26A1";
    emoji.style.fontSize = "3rem";
    emoji.style.filter = "drop-shadow(0 0 20px rgba(6,255,240,0.35))";
    emoji.setAttribute("aria-hidden", "true");

    media.appendChild(emoji);

    var body = document.createElement("div");
    body.className = "card__body";

    var title = document.createElement("h3");
    title.className = "card__title";
    title.textContent = post.title;

    var metaWrapper = document.createElement("div");
    metaWrapper.className = "meta";

    if (post.readMin) {
      metaWrapper.appendChild(createMetaBadge(post.readMin + " min"));
    }
    metaWrapper.appendChild(createMetaBadge(post.tagMeta.label));

    var excerpt = document.createElement("p");
    excerpt.className = "card__text txt-dim";
    excerpt.textContent = post.excerpt;

    body.appendChild(title);
    body.appendChild(metaWrapper);
    body.appendChild(excerpt);

    article.appendChild(media);
    article.appendChild(body);

    return article;
  }

  function renderHighlights() {
    var prepared = clearContainer(HIGHLIGHT_SELECTOR, HIGHLIGHT_EMPTY_SELECTOR);
    if (!prepared.container) {
      return;
    }

    var highlightCandidates = posts.filter(function (item) { return item.featured; });
    if (highlightCandidates.length < MAX_HIGHLIGHTS) {
      posts.forEach(function (item) {
        if (highlightCandidates.length >= MAX_HIGHLIGHTS) {
          return;
        }
        if (!item.featured) {
          highlightCandidates.push(item);
        }
      });
    }

    var selection = highlightCandidates.slice(0, MAX_HIGHLIGHTS);

    if (!selection.length) {
      if (prepared.emptyNode) {
        prepared.emptyNode.style.display = "";
      }
      return;
    }

    selection.forEach(function (post, index) {
      prepared.container.appendChild(createCard(post, index * 80));
    });
  }

  function renderList() {
    var prepared = clearContainer(LIST_SELECTOR, LIST_EMPTY_SELECTOR);
    if (!prepared.container) {
      return;
    }

    var list = posts;
    if (activeFilter !== ALL_FILTER_VALUE) {
      list = posts.filter(function (post) { return post.tag === activeFilter; });
    }

    if (!list.length) {
      if (prepared.emptyNode) {
        prepared.emptyNode.style.display = "";
      }
      return;
    }

    list.forEach(function (post, index) {
      prepared.container.appendChild(createCard(post, index * 60));
    });
  }

  function updateFilterButtons() {
    var buttons = document.querySelectorAll(FILTER_SELECTOR);
    if (!buttons.length) {
      return;
    }
    Array.prototype.forEach.call(buttons, function (btn) {
      var value = btn.getAttribute("data-blog-filter") || ALL_FILTER_VALUE;
      var isActive = value === activeFilter;
      if (isActive) {
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.classList.remove("is-active");
        btn.setAttribute("aria-pressed", "false");
      }
    });
  }

  function initFilters() {
    var buttons = document.querySelectorAll(FILTER_SELECTOR);
    if (!buttons.length) {
      return;
    }
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        var value = btn.getAttribute("data-blog-filter") || ALL_FILTER_VALUE;
        if (value === activeFilter) {
          return;
        }
        activeFilter = value;
        updateFilterButtons();
        renderList();
      });
    });
  }

  function bootstrap() {
    // Fetch mit Timeout (5 Sekunden)
    const fetchWithTimeout = (url, options = {}, timeout = 5000) => {
      return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);
    };
    
    fetchWithTimeout(DATA_URL, { cache: "no-cache" }, 5000)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        posts = normalisePosts(data);
      })
      .catch(function (error) {
        console.error("Blogdaten konnten nicht geladen werden:", error);
        posts = [];
      })
      .finally(function () {
        initFilters();
        updateFilterButtons();
        renderHighlights();
        renderList();
        document.dispatchEvent(new CustomEvent("blog:rendered"));
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
