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
