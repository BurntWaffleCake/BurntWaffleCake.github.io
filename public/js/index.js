document.addEventListener("DOMContentLoaded", () => {
  var tl = anime.timeline({
    easing: "easeOutExpo",
    duration: 750,
  });

  tl.add({
    targets: "#vanta-globe",
    translateX: "-50px",

    easing: "spring(1, 80, 10, 0)",
    complete: connectMouseMove,
  })
    .add(
      {
        targets: "#main-background",
        translateX: 0,

        opacity: 1,
      },
      "-=1000"
    )
    .add(
      {
        targets: "#main-title",
        translateX: 0,
        opacity: 1,
      },
      "-=800"
    )
    .add(
      {
        targets: "#sub-title",
        translateX: 0,
        opacity: 1,
      },
      "-=600"
    )
    .add(
      {
        targets: ".link",
        translateX: 0,
        opacity: 1,
        delay: anime.stagger(100), // increase delay by 100ms for each elements.
      },
      "-=300"
    );
});

const links = document.getElementsByClassName("link");
for (let link of links) {
  link.onmouseover = () => {
    anime({
      targets: link,
      translateX: 15,
    });
  };

  link.onmouseout = () => {
    anime({
      targets: link,
      translateX: 0,
    });
  };
}

const offset = 250;
const background = document.getElementById("vanta-globe");
function connectMouseMove() {
  // document.onmousemove = function (evt) {
  //   let xRatio = evt.clientX / window.innerWidth - 0.5;
  //   let yRatio = evt.clientY / window.innerHeight - 0.5;
  //   background.style.top = `${window.innerHeight / 2 + offset * yRatio}px`;
  //   background.style.left = `${window.innerWidth / 2 + offset * xRatio}px`;
  // };
}
