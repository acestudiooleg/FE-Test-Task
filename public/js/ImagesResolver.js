window.ImagesResolver = (function () {
  class ImagesResolver {
    constructor() {}

    search(query) {
      if (!query) return { query, images: [] };

      const lowercasedQuery = query.toLowerCase();

      const images = window.localDB
        .filter((item) => {
          const itemTags = item.tags.split(", ");

          return itemTags.includes(lowercasedQuery);
        })
        .map(({ id, previewURL, tags }) => ({
          id,
          url: previewURL,
          tags,
        }));

      return { query, images };

      // return {
      //   query: "example",
      //   images: [
      //     {
      //       id: 1,
      //       url: "/img/mammal-3162194_640.jpg",
      //       tags: "panda",
      //     },
      //     {
      //       id: 2,
      //       url: "/img/panda-659186_640.png",
      //       tags: "panda",
      //     },
      //   ],
      // };
    }
  }

  return ImagesResolver;
})();
