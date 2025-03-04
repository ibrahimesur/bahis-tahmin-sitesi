module.exports = {
  stackbitVersion: "~0.6.0",
  nodeVersion: "18",
  ssgName: "nextjs",
  contentSources: [],
  models: {
    page: {
      type: "page",
      urlPath: "/{slug}",
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
  }
}; 