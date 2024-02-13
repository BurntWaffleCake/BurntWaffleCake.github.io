function uuidv4() {
  return "id" + "10000000100040008000100000000000".replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
}

const mainNavBar = document.getElementById("mainNavBar");
if (mainNavBar && main_env) {
  main_env.mainLinks.elements.forEach((navItem) => {
    switch (navItem.type) {
      case "basic":
        const basicHref = navItem.href;
        const basicName = navItem.name;

        if (!basicHref) {
          console.warn("MainNavBar basic component missing href");
          return;
        }

        if (!basicName) {
          console.warn("MainNavBar basic component missing name");
          return;
        }

        mainNavBar.innerHTML += `
        <li class="nav-item">
          <a class="nav-link" href="${basicHref}">${basicName}</a>
        </li>
      `;
        break;
      case "dropdown":
        let inner = "";
        const dropdownName = navItem.name;
        navItem.items.forEach((item) => {
          const href = item.href;
          const name = item.name;
          if (!href) {
            console.warn("MainNavBar dropdown link component missing href");
            return;
          }
          if (!name) {
            console.warn("MainNavBar dropdown link component missing name");
            return;
          }

          inner += `<a class="dropdown-item" href="${href}">${name}</a>`;
        });

        mainNavBar.innerHTML += `<li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${dropdownName}</a>
            <div class="dropdown-menu mb-3">
              ${inner}
            </div>
          </li>
        `;
        break;
      case undefined:
        console.warn(`MainNavBar component type not defined`);
        break;
      default:
        console.warn(`${navItem.type} is not a valid MainNavBar component type`);
        break;
    }
  });
} else if (!main_env) {
  console.warn("Environment missing MainNavBar environment values");
}

const rightBookmark = document.getElementById("right_side_bar");
const body = document.getElementsByTagName("body")[0];
console.log(body, rightBookmark);

if (rightBookmark && body) {
  let data = {
    elements: [],
  };
  const bookmarks = document.getElementsByClassName("bookmark");

  let inner = "";
  for (let bookmark of bookmarks) {
    let id = uuidv4();

    let skew = Number(bookmark.dataset.skew);
    if (!skew) {
      skew = 0;
    }

    inner += `
    <a href="#${id}" id="pointer_${id}" class="sidebar-dropdown-link text-decoration-none" style="color: gray; margin-left: 1.5rem !important;">
    <p class="m-0" style="padding-left: ${skew + 1}rem ;">${bookmark.textContent}</p>
    </a>
    `;

    bookmark.innerHTML += `
    <anchor id="${id}" style="display: block;
    top: 0rem;
    visibility: hidden;"></anchor>`;
  }
  rightBookmark.innerHTML = inner;

  body.onscroll = function (evt) {
    for (let bookmark of bookmarks) {
      let link = document.getElementById("pointer_" + bookmark.getElementsByTagName("anchor")[0].id);
      if (!link) {
        console.log("Bookmark attributed link not found!");
        continue;
      }
      if (bookmark.getBoundingClientRect().top - window.innerHeight < 0) {
        link.style.borderLeft = "3px solid gray";
      } else {
        link.style.borderLeft = "3px solid rgba(0,0,0,0)";
      }
    }
  };
}

const offCanvasBody = document.getElementById("offCanvasNav");
function generateLeftNavBar(parent, data) {
  data.elements.forEach((element) => {
    if (element.type == "basic") {
      let inner = `<a href="${element.href}" class="sidebar-dropdown-link text-decoration-none text-light-emphasis" style="margin-left: 1.5rem !important;">${element.name}</a>`;
      offCanvasBody.innerHTML += inner;
      parent.innerHTML += inner;
    } else if (element.type == "category") {
      let id = uuidv4();
      let inner = "";

      element.links.forEach((link) => {
        inner += `<a href="${link.href}" class="sidebar-dropdown-link text-decoration-none text-light-emphasis" style="margin-left: 1.5rem !important;">${link.name}</a>`;
      });
      inner = `<a class="h4 mt-3 text-decoration-none m-0 mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false" aria-controls="contentId">
                  <p class="h5 m-0 sidebar-dropdown-category-label" style="word-wrap: break-word"><i id="icon_${id}" class="bi bi-caret-right-fill"></i>${element.name}</p>
                </a>
              <div class="collapse show" id="${id}">
                <div class="d-flex flex-column">
                ${inner}
                </div>
              </div>`;
      offCanvasBody.innerHTML += inner;
      parent.innerHTML += inner;

      let parentLink = document.getElementById(`parent_${id}`);
      let icon = document.getElementById(`icon_${id}`);

      console.log(parentLink);
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

button.addEventListener("click", () => {
  if (theme == "dark") {
    theme = "light";
  } else {
    theme = "dark";
  }
  updateTheme();
});
