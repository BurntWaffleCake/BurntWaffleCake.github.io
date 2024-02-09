function uuidv4() {
  return "id" + "10000000100040008000100000000000".replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
}

const mainNavBar = document.getElementById("mainNavBar");
env.mainLinks.elements.forEach((navItem) => {
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
        <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${navItem.name}</a>
        <div class="dropdown-menu mb-3">
          ${inner}
        </div>
      </li>
    `;
  }
});

const rightBookmark = document.getElementById("right_side_bar");
const mainContent = document.getElementById("body");

function generateBookmarkData() {
  let data = {
    elements: [],
  };
  const bookmarks = document.getElementsByClassName("bookmark");

  let inner = "";
  for (let bookmark of bookmarks) {
    let id = uuidv4();
    bookmark.id = id;

    if (bookmark.classList.contains("bookmark-emphasis")) {
      inner += `<a href="#${id}" class="sidebar-dropdown-link text-decoration-none" style="margin-left: 1.5rem !important;">${bookmark.textContent}</a>`;
    } else {
    }
  }
  rightBookmark.innerHTML = inner;

  mainContent.onscroll = function (evt) {
    for (let bookmark of bookmarks) {
      if (bookmark.getBoundingClientRect().top - window.innerHeight < -window.innerHeight / 2) {
        bookmark.style.backgroundColor = "red";
      } else {
      }
    }
  };
  return data;
}

console.log(generateBookmarkData());

function generateLeftNavBar(parent, data) {
  data.elements.forEach((element) => {
    if (element.type == "basic") {
      let inner = `<a href="${element.href}" class="sidebar-dropdown-link text-decoration-none" style="margin-left: 1.5rem !important;">${element.name}</a>`;
      parent.innerHTML += inner;
    } else if (element.type == "category") {
      let id = uuidv4();
      let inner = "";

      element.links.forEach((link) => {
        inner += `<a href="${link.href}" class="sidebar-dropdown-link text-decoration-none" style="margin-left: 1.5rem !important;">${link.name}</a>`;
      });
      parent.innerHTML += `
    <a class="h4 mt-3 text-decoration-none m-0" type="button" data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false" aria-controls="contentId">
    <p class="h5 m-0 sidebar-dropdown-category-label" style="word-wrap: break-word"><i class="bi bi-caret-right-fill"></i>${element.name}</p>
  </a>
            <div class="collapse show" id="${id}">
              <div class="d-flex flex-column">
              ${inner}
              </div>
            </div>`;
    }
  });
}

const leftSideBar = document.getElementById("left_side_bar");
const rightSideBar = document.getElementById("right_side_bar");
generateLeftNavBar(leftSideBar, env.leftSideBar);

const html = document.getElementById("html");
const button = document.getElementById("theme_toggle_button");

var theme = localStorage.getItem("theme");

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
