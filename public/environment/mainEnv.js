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
            href: "/public/articles/projects/physics/index.html",
          },
          {
            name: "Sorting Algorithms",
            href: "/public/index.html",
          },
          {
            name: "Rendering",
            href: "/public/index.html",
          },
        ],
      },
    ],
  },
};
