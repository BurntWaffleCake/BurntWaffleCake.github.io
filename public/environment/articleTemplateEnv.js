const env = {
  leftSideBar: {
    elements: [
      {
        type: "basic",
        name: "Home",
        href: "/public/articles/index.html",
      },
      {
        type: "divider",
      },
      {
        type: "category",
        name: `<i class="bi bi-grid-3x2"></i> Algorithms`,
        links: [
          {
            name: "Introduction",
            href: "/public/articles/algorithms/index.html",
          },
        ],
      },
      {
        type: "divider",
      },

      {
        type: "category",
        name: `<i class="bi bi-boxes"></i> Physics`,
        links: [
          {
            name: "Introduction",
            href: "/public/articles/physics/index.html",
          },
        ],
      },
      {
        type: "category",
        name: `<i class="bi bi-boxes"></i> Physics Engine`,
        links: [
          {
            name: "Introduction",
            href: "/public/articles/physics/physicsEngine/template.html",
          },
        ],
      },

      {
        type: "divider",
      },

      {
        type: "category",
        name: `<i class="bi bi-box"></i> Graphics`,
        links: [
          {
            name: "Introduction",
            href: "/public/articles/graphics/index.html",
          },
        ],
      },
    ],
  },
};
