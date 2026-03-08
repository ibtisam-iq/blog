// =============================================================================
// TAGS PAGE — Dynamic filter
// Renders a chip bar above the tag list. Clicking a chip hides every tag
// section except the selected one. Clicking the active chip (or "All") resets.
// Works with MkDocs Material's built-in tags plugin DOM structure.
// =============================================================================

document.addEventListener("DOMContentLoaded", function () {
  initTagFilter();
});

// Re-run on instant navigation (MkDocs Material SPA behaviour)
document$.subscribe(function () {
  initTagFilter();
});

function initTagFilter() {
  // Only run on the /tags/ page
  if (!location.pathname.includes("/tags")) return;

  const article = document.querySelector("article.md-content__inner");
  if (!article) return;

  // Collect all tag sections — each is an <h2> followed by a <ul>
  const headings = Array.from(article.querySelectorAll("h2"));
  if (headings.length === 0) return;

  // Avoid injecting the filter bar more than once (instant nav guard)
  if (article.querySelector(".tag-filter-bar")) return;

  // Build chip bar
  const bar = document.createElement("div");
  bar.className = "tag-filter-bar";

  // "All" chip
  const allChip = document.createElement("button");
  allChip.className = "tag-filter-chip tag-filter-chip--active";
  allChip.textContent = "All";
  allChip.dataset.tag = "";
  bar.appendChild(allChip);

  // One chip per tag heading
  headings.forEach(function (h2) {
    const tagEl = h2.querySelector(".md-tag") || h2;
    const label = tagEl.textContent.trim();
    const chip = document.createElement("button");
    chip.className = "tag-filter-chip";
    chip.textContent = label;
    chip.dataset.tag = h2.id;
    bar.appendChild(chip);
  });

  // Insert bar before the first heading
  article.insertBefore(bar, headings[0]);

  // Each tag section = the h2 + every sibling until the next h2
  function getSectionNodes(h2) {
    const nodes = [h2];
    let next = h2.nextElementSibling;
    while (next && next.tagName !== "H2") {
      nodes.push(next);
      next = next.nextElementSibling;
    }
    return nodes;
  }

  const sections = headings.map(getSectionNodes);

  function showAll() {
    sections.forEach(function (nodes) {
      nodes.forEach(function (n) { n.style.display = ""; });
    });
  }

  function showOnly(targetId) {
    sections.forEach(function (nodes) {
      const h2 = nodes[0];
      const visible = h2.id === targetId;
      nodes.forEach(function (n) {
        n.style.display = visible ? "" : "none";
      });
    });
  }

  // Click handler
  bar.addEventListener("click", function (e) {
    const chip = e.target.closest(".tag-filter-chip");
    if (!chip) return;

    const active = bar.querySelector(".tag-filter-chip--active");

    // Clicking the already-active non-All chip → reset to All
    if (chip === active && chip !== allChip) {
      allChip.classList.add("tag-filter-chip--active");
      chip.classList.remove("tag-filter-chip--active");
      showAll();
      return;
    }

    active.classList.remove("tag-filter-chip--active");
    chip.classList.add("tag-filter-chip--active");

    if (chip === allChip) {
      showAll();
    } else {
      showOnly(chip.dataset.tag);
    }
  });
}

