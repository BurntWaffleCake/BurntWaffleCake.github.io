const env = {
  path: [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Sub",
      href: "",
    },
    {
      name: "Active",
      href: "",
    },
  ],

  leftSideBar: {
    elements: [
      {
        type: "basic",
        name: "Linkus",
        href: "/",
      },
      {
        type: "category",
        name: `<i class="bi bi-grid-3x2"></i> Algorithms`,
        links: [
          {
            name: "Link1",
            href: "https://www.google.com/",
          },
        ],
      },
      {
        type: "category",
        name: `<i class="bi bi-boxes"></i> Physics`,
        links: [
          {
            name: "Link1",
            href: "https://www.google.com/",
          },
        ],
      },

      {
        type: "category",
        name: `<i class="bi bi-box"></i> Rendering`,
        links: [
          {
            name: "Link1",
            href: "https://www.google.com/",
          },
        ],
      },
    ],
  },
};

console.log(env);
