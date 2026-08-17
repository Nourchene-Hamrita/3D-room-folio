// =============================================================
// Modals.js — open/close the UI panels with Nourchene's data
// =============================================================

export function initModals(app, audio) {
  const data = app.data;

  // ---------- Inject project cards into the Work modal ----------
  const workGrid = document.getElementById("work-grid");
  data.projects.forEach((project) => {
    const card = document.createElement("button");
    card.className = "project-card";
    card.setAttribute("data-project-id", project.id);
    card.innerHTML = `
      <div class="project-icon">${escapeHtml(project.icon || project.title[0])}</div>
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

  // ---------- Inject experience timeline ----------
  const timeline = document.getElementById("timeline");
  data.experience.forEach((item) => {
    const node = document.createElement("div");
    node.className = "timeline-item";
    node.innerHTML = `
      <p class="timeline-role">${escapeHtml(item.role)}</p>
      <p class="timeline-company">${escapeHtml(item.company)}</p>
      <span class="timeline-date">${escapeHtml(item.date)}</span>
      <p class="timeline-desc">${escapeHtml(item.description)}</p>
    `;
    timeline.appendChild(node);
  });

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
                  (l) =>
                    `<a class="project-tag" href="${escapeAttr(l.href)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none; cursor:pointer;">${escapeHtml(l.label)} →</a>`
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
