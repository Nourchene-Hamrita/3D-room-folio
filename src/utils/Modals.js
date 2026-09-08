// =============================================================
// Modals.js — open/close the UI panels with Nourchene's data
// =============================================================

export function initModals(app, audio) {
  const data = app.data;

  // ---------- Inject project cards into the Work modal ----------
  const workGrid = document.getElementById("work-grid");
  data.projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";
    card.setAttribute("data-project-id", project.id);
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    const githubLink = project.links?.find((link) => link.github) ||
      project.links?.find((link) => /github/i.test(link.label || ""));
    const githubUrl = project.github || githubLink?.github || githubLink?.href;
    card.innerHTML = `
      <div class="project-icon">${escapeHtml(project.icon || project.title[0])}</div>
      ${
        githubUrl
          ? `<a class="project-repo-link" href="${escapeAttr(githubUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeAttr(project.title)} repository on GitHub" title="Open repository on GitHub">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>`
          : ""
      }
      <h3 class="project-title">${escapeHtml(project.title)}</h3>
      <p class="project-summary">${escapeHtml(project.summary)}</p>
      <div class="project-tags">
        ${project.tags
          .slice(0, 4)
          .map((t) => `<span class="project-tag">${escapeHtml(t)}</span>`)
          .join("")}
      </div>
    `;
    card.addEventListener("click", () => openProject(project.id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProject(project.id);
      }
    });
    card.querySelector(".project-repo-link")?.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    workGrid.appendChild(card);
  });

  // ---------- Inject skills ----------
  const skillsGrid = document.getElementById("skills-grid");
  data.skills.forEach((skill) => {
    const chip = document.createElement("span");
    chip.className = "skill-chip";
    chip.textContent = skill;
    skillsGrid.appendChild(chip);
  });

  // ---------- Inject certification cards ----------
  const certificationsGrid = document.getElementById("certifications-grid");
  data.certifications.forEach((certification) => {
    const card = document.createElement("a");
    card.className = `certification-card certification-${certification.accent || "violet"}`;
    card.href = certification.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.setAttribute("aria-label", `Open ${certification.name} certification`);
    card.innerHTML = `
      <div class="certification-quote" aria-hidden="true">\"</div>
      <div class="certification-mark" aria-label="${escapeAttr(certification.issuer)} logo">
        ${certification.logo
          ? `<img src="${escapeAttr(certification.logo)}" alt="${escapeAttr(certification.issuer)} logo" />`
          : escapeHtml(certification.mark || getCompanyMark(certification.issuer))}
      </div>
      <div class="certification-info">
        <h4>${escapeHtml(certification.name)}</h4>
        <p>${escapeHtml(certification.issuer)}</p>
        <time datetime="${escapeAttr(certification.date)}">${escapeHtml(certification.date)}</time>
      </div>
    `;
    certificationsGrid.appendChild(card);
  });
  setupScrollReveal(certificationsGrid, ".certification-card", "is-visible");

  // ---------- Inject experience timeline ----------
  const timeline = document.getElementById("timeline");
  data.experience.forEach((item) => {
    const node = document.createElement("div");
    node.className = "timeline-item";
    const companyMark = getCompanyMark(item.company);
    const companyLogo = item.logo
      ? `<img src="${escapeAttr(item.logo)}" alt="${escapeAttr(item.company)} logo" />`
      : `<span>${escapeHtml(companyMark)}</span>`;
    node.innerHTML = `
      <div class="timeline-marker" title="${escapeAttr(item.company)}" aria-label="${escapeAttr(item.company)} logo">${companyLogo}</div>
      <div class="timeline-content">
        <div class="timeline-topline">
          <span class="timeline-date">${escapeHtml(item.date)}</span>
          ${item.location ? `<span class="timeline-location">${escapeHtml(item.location)}</span>` : ""}
        </div>
        <p class="timeline-role">${escapeHtml(item.role)}</p>
        <p class="timeline-company">${escapeHtml(item.company)}</p>
        <ul class="timeline-desc">
          ${(Array.isArray(item.description) ? item.description : [item.description])
            .map((point) => `<li>${escapeHtml(point)}</li>`)
            .join("")}
        </ul>
        ${
          item.tools?.length
            ? `<div class="timeline-tools">${item.tools
                .map((tool) => `<span>${escapeHtml(tool)}</span>`)
                .join("")}</div>`
            : ""
        }
      </div>
    `;
    timeline.appendChild(node);
  });

  setupTimelineReveal(timeline);

  // ---------- Modal open/close logic ----------
  const modals = Array.from(document.querySelectorAll(".modal"));

  function open(name) {
    const modal = document.getElementById(`modal-${name}`);
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close(name) {
    const modal = document.getElementById(`modal-${name}`);
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function closeAll() {
    modals.forEach((m) => {
      m.classList.remove("is-open");
      m.setAttribute("aria-hidden", "true");
    });
    document.body.style.overflow = "";
  }

  function openProject(projectId) {
    const project = data.projects.find((p) => p.id === projectId);
    if (!project) return;
    const body = document.getElementById("project-detail-body");
    body.innerHTML = `
      <div class="project-detail-content">
        <div class="project-detail-hero">
          <div style="display:flex; align-items:center; gap:1rem; margin-bottom:0.6rem;">
            <div class="project-icon" style="width:52px; height:52px; font-size:1.4rem;">${escapeHtml(project.icon || project.title[0])}</div>
            <div>
              <p class="modal-eyebrow" style="margin-bottom:0.2rem;">~ Project ~</p>
              <h2 class="project-detail-title">${escapeHtml(project.title)}</h2>
            </div>
          </div>
          <p class="project-detail-desc">${escapeHtml(project.description)}</p>
        </div>

        ${
          project.longDescription
            ? project.longDescription
                .map(
                  (p) => `
                <div class="project-detail-section">
                  <h4>Highlights</h4>
                  <p>${escapeHtml(p)}</p>
                </div>
              `
                )
                .join("")
            : ""
        }

        <div class="project-detail-section">
          <h4>Tech & Skills</h4>
          <div class="project-detail-tags">
            ${project.tags.map((t) => `<span class="project-tag">${escapeHtml(t)}</span>`).join("")}
          </div>
        </div>

        ${
          project.links && project.links.length
            ? `
          <div class="project-detail-section">
            <h4>Links</h4>
            <div class="project-detail-tags">
              ${project.links
                .map(
                    (l) => {
                      const href = l.href || l.github;
                      const label = l.label || "GitHub repository";
                      return `<a class="project-tag" href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none; cursor:pointer;">${escapeHtml(label)} →</a>`;
                    }
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;
    open("project");
  }

  // Wire up close buttons
  document.querySelectorAll("[data-modal-close]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAll();
      if (audio) audio.close();
    });
  });

  // Click outside the modal-card to close
  modals.forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeAll();
        if (audio) audio.close();
      }
    });
  });

  // ESC closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.querySelector(".modal.is-open")) {
      closeAll();
      if (audio) audio.close();
    }
  });

  // Wire up the topbar nav buttons
  document.querySelectorAll(".nav-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      if (action === "work" || action === "about" || action === "contact") {
        open(action);
      }
    });
  });

  return { open, close, openProject, closeAll };
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s) {
  return escapeHtml(s);
}

function getCompanyMark(company) {
  const words = String(company || "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "CO";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function setupTimelineReveal(timeline) {
  setupScrollReveal(timeline, ".timeline-item", "is-visible");
}

function setupScrollReveal(container, selector, visibleClass) {
  const items = Array.from(container.querySelectorAll(selector));
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add(visibleClass));
    return;
  }

  const scrollRoot = container.closest(".modal-body");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(visibleClass);
        observer.unobserve(entry.target);
      });
    },
    {
      root: scrollRoot,
      threshold: 0.14,
      rootMargin: "0px 0px -6% 0px",
    }
  );

  items.forEach((item) => observer.observe(item));
}
