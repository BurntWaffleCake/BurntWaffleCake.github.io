const main_env = {
  mainLinks: {
    elements: [
      {
        type: "basic",
        name: "Home",
        href: "/public/index.html",
      },
      {
        type: "dropdown",
        name: "Articles",
        href: "/",
        items: [
          {
            name: "Physics",
            href: "/public/articles/physics/index.html",
          },
          {
            name: "Algorithms",
            href: "/public/articles/algorithms/index.html",
          },
          {
            name: "Rendering",
            href: "/public/articles/rendering/index.html",
          },
        ],
      },
    ],
  },
};
