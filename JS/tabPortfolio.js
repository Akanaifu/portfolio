function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

async function fetchJson(file) {
  const res = await fetch(file);
  if (!res.ok) throw new Error(`Erreur chargement ${file}: ${res.status}`);
  return res.json();
}

function getTableHeaders(table) {
  return Array.from(table.querySelectorAll("thead th")).map((th) =>
    th.textContent.trim()
  );
}

function ensureTbody(table) {
  let tbody = table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
  }
  return tbody;
}

function groupByCategory(data) {
  const map = new Map();
  data.forEach((item) => {
    const key = item.categorie ?? "";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return Array.from(map.entries()).map(([categorie, rows]) => ({
    categorie,
    rows,
  }));
}

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD") // décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, "") // retire diacritiques
    .replace(/[^a-z0-9]+/g, "-") // remplace tout ce qui n'est pas alnum par '-'
    .replace(/^-+|-+$/g, ""); // supprime tirets en bordure
}

function buildGroupedTbodyHtml(groups, headers) {
  //   hearders[0] == categ
  //   hearders[1] == nom
  //   hearders[2] == prestée
  //   hearders[3] == valorisée
  return groups
    .map(({ categorie, rows }) => {
      const catClass = "cat-" + slugify(categorie);
      return rows
        .map((row, idx) => {
          const nomSlug = slugify(row.nom);
          const nomLink = `<a href="detailActivite/activite.html?activity=${nomSlug}" class="activity-link">${
            capitalizeFirstLetter(row.nom) ?? ""
          }</a>`;

          if (idx === 0) {
            const values = [
              `<td class="category-label ${catClass}" data-label="${
                headers[0]
              }" rowspan="${rows.length}">${capitalizeFirstLetter(
                categorie
              )}</td>`,
              `<td data-label="${headers[1]}">${nomLink}</td>`,
              `<td data-label="${headers[2]}">${
                row.heures_prestees ?? ""
              }</td>`,
              `<td data-label="${headers[3]}">${
                row.heures_valorisees ?? ""
              }</td>`,
            ];
            return `<tr class="${catClass}">${values.join("")}</tr>`;
          } else {
            const values = [
              `<td data-label="${headers[1]}">${nomLink}</td>`,
              `<td data-label="${headers[2]}">${
                row.heures_prestees ?? ""
              }</td>`,
              `<td data-label="${headers[3]}">${
                row.heures_valorisees ?? ""
              }</td>`,
            ];
            return `<tr class="${catClass}">${values.join("")}</tr>`;
          }
        })
        .join("");
    })
    .join("");
}

function calculateTotals(data) {
  const parseHours = (value) => {
    if (!value) return 0;

    const cleaned = String(value).replace(/[^\d.,]/g, "");

    const normalized = cleaned.replace(",", ".");
    return parseFloat(normalized) || 0;
  };

  const totalPrestees = data.reduce(
    (sum, item) => sum + parseHours(item.heures_prestees),
    0
  );
  const totalValorisees = data.reduce(
    (sum, item) => sum + parseHours(item.heures_valorisees),
    0
  );
  return { totalPrestees, totalValorisees };
}

function buildTotalRow(headers, totals) {
  return `
    <tr class="total-row">
      <td class="category-label total-label" data-label="">Total</td>
      <td></td>
      <td data-label="${headers[2]}">~${totals.totalPrestees}h</td>
      <td data-label="${headers[3]}">${totals.totalValorisees}h</td>
    </tr>
  `;
}

async function createTab(idTab, file) {
  try {
    const data = await fetchJson(file);

    if (window.updateVeloHours) {
      const veloStats = await updateVeloHours();
      if (veloStats) {
        const veloEntry = data.find(
          (item) => item.nom.toLowerCase() === "vélo"
        );
        if (veloEntry) {
          veloEntry.heures_prestees = `~${veloStats.hours}h`;
        }
      }
    }

    const table = document.getElementById(idTab);
    const headers = getTableHeaders(table);
    const tbody = ensureTbody(table);

    const groups = groupByCategory(data);
    const totals = calculateTotals(data);
    tbody.innerHTML =
      buildGroupedTbodyHtml(groups, headers) + buildTotalRow(headers, totals);
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  createTab("table", "DATA/tabPortfolio.json");
});
