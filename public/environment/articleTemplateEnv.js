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

  mainLinks: {
    elements: [
      {
        type: "basic",
        name: "Home",
        href: "/public/index.html",
      },
      {
        type: "dropdown",
        name: "Home",
        href: "/public/index.html",
        items: [
          {
            name: "brother",
            href: "/public/index.html",
          },
          {
            name: "in",
            href: "/public/index.html",
          },
          {
            name: "christ",
            href: "/public/index.html",
          },
        ],
      },
    ],
  },

  leftSideBar: {
    elements: [
      {
        type: "category",
        name: "SidebarCategory",
        links: [
          {
            name: "Link1",
            href: "https://www.google.com/",
          },
          {
            name: "Link2",
            href: "https://www.google.com/",
          },
          {
            name: "Link3",
            href: "https://www.google.com/",
          },
        ],
      },
    ],
  },
};

console.log(env);
