const env = {
  leftSideBar: {
    elements: [
      {
        type: "basic",
        name: "Home",
        href: "/public/articles/index.html",
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
        name: `<i class="bi bi-box"></i> Rendering`,
        links: [
          {
            name: "Introduction",
            href: "/public/articles/rendering/index.html",
          },
        ],
      },
    ],
  },
};

console.log(env);
