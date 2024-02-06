document.addEventListener("DOMContentLoaded", () => {
  var tl = anime.timeline({
    easing: "easeOutExpo",
    duration: 750,
  });

  tl.add({
    targets: "#vanta-globe",
    translateX: 0,
    easing: "spring(1, 80, 10, 0)",
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
