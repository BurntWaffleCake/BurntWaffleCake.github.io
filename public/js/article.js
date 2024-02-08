function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
}

const mainNavBar = document.getElementById("mainNavBar");
env_main_pages.mainPageLinks.forEach((navItem) => {
  if (navItem.type == "basic") {
    mainNavBar.innerHTML += `
    <li class="nav-item">
      <a class="nav-link" href="${navItem.href}">${navItem.name}</a>
    </li>
  `;
  } else if (navItem.type == "dropdown") {
    let inner = "";
    navItem.items.forEach((item) => {
      inner += `<a class="dropdown-item" href="${item.href}">${item.name}</a>`;
    });

    let id = uuidv4();
    mainNavBar.innerHTML += `<li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="${id}" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${navItem.name}</a>
        <div class="dropdown-menu mb-3" aria-labelledby="${id}">
          ${inner}
        </div>
      </li>
    `;
  }
});

const html = document.getElementById("html");
const button = document.getElementById("theme_toggle_button");

var theme = localStorage.getItem("theme");
console.log(theme);

if (!theme) {
  theme = "light";
}

function updateTheme() {
  if (theme == "dark") {
    localStorage.setItem("theme", "dark");
    button.classList.remove("btn-light");
    button.classList.add("btn-dark");
    html.dataset["bsTheme"] = "dark";
    button.innerHTML = `<i class="bi bi-moon-stars-fill"></i>`;
  } else {
    localStorage.setItem("theme", "light");
    button.classList.remove("btn-dark");
    button.classList.add("btn-light");
    html.dataset["bsTheme"] = "light";
    button.innerHTML = `<i class="bi bi-sun-fill"></i>`;
  }
}
updateTheme();

button.onclick = () => {
  if (theme == "dark") {
    theme = "light";
  } else {
    theme = "dark";
  }
  updateTheme();
};
