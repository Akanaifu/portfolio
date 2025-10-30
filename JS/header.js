function createHeader() {
  // Détecter si on est dans un sous-dossier
  const pathDepth =
    window.location.pathname.split("/").filter((p) => p && p.includes(".html"))
      .length > 0
      ? (window.location.pathname.match(/\//g) || []).length - 1
      : 0;
  const relativePath = pathDepth > 1 ? "../" : "";

  const header = document.createElement("header");
  header.innerHTML = `
    <div class="header-container">
      <div class="header-left">
      <a href="${relativePath}index.html">
        <img src="${relativePath}IMG/photo_profil/Nathan1.jpg" alt="Nathan Lemaire" class="header-profile-img" />
      </a>
      <a href="${relativePath}index.html" class="header-logo">Nathan Lemaire</a>
      </div>
      <button class="menu-toggle" aria-label="Toggle menu">
        ☰
      </button>
      <nav class="header-nav">
        <a href="${relativePath}projets.html">Projets</a>
        <a href="${relativePath}about.html">About Me</a>
        <a href="${relativePath}cv.html">CV</a>
        <a href="${relativePath}tabPortfolio.html">Portfolio</a>
      </nav>
    </div>
  `;

  document.body.insertBefore(header, document.body.firstChild);

  const menuToggle = header.querySelector(".menu-toggle");
  const nav = header.querySelector(".header-nav");

  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
    });
  });

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  nav.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.includes(currentPage)) {
      link.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", createHeader);
