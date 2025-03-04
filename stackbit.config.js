module.exports = {
  stackbitVersion: "~0.6.0",
  ssgName: "nextjs",
  nodeVersion: "18",
  contentSources: [
    {
      name: "git",
      type: "git",
      rootPath: "content",
      models: [
        {
          type: "page",
          name: "page",
          urlPath: "/{slug}",
          filePath: "content/pages/{slug}.md",
          fields: [
            {
              type: "string",
              name: "title",
              label: "Title",
              required: true
            },
            {
              type: "string",
              name: "slug",
              label: "Slug",
              required: true
            },
            {
              type: "markdown",
              name: "content",
              label: "Content"
            }
          ]
        }
      ]
    }
  ],
  presets: [
    {
      label: "Default",
      models: [
        {
          name: "page",
          data: {
            title: "Yeni Sayfa",
            slug: "yeni-sayfa",
            content: "Bu bir örnek içeriktir."
          }
        }
      ]
    }
  ],
  pageLayoutComponent: "PageLayout",
  pageComponents: {
    page: {
      component: "PageLayout",
      fields: ["title", "content"]
    }
  },
  components: {
    PageLayout: {
      fields: ["title", "content"]
    }
  },
  siteConfig: {
    title: "Bahis Tahmin Sitesi",
    description: "Profesyonel bahis tahminleri ve analizleri"
  }
}; 