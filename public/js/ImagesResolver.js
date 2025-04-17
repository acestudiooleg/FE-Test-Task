window.ImagesResolver = (function () {
  class ImagesResolver {
    constructor() {}

    _validateSearchModuleId(searchModuleId) {
      if (!searchModuleId) {
        throw new Error("searchModuleId is required");
      }
    }

    _getSearchModule(searchModuleId) {
      const module = window[searchModuleId];
      if (!module) {
        throw new Error("Unknown search module: " + searchModuleId);
      }
      return module;
    }

    _normalizeQuery(query) {
      return query?.trim().toLowerCase();
    }

    _searchAsync(moduleFn, query, signal) {
      return moduleFn(query, signal).then((images) => ({
        query,
        images,
      }));
    }

    _searchSync(dataArray, query) {
      //O(n)
      const filteredImages = dataArray.filter((item) => {
        const tags = item.tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase());
        return tags.includes(query);
      });

      return {
        query,
        images: filteredImages.map((image) => ({
          id: image.id,
          url: image.previewURL,
          tags: image.tags,
        })),
      };
    }

    search(query, searchModuleId, signal) {
      this._validateSearchModuleId(searchModuleId);

      const module = this._getSearchModule(searchModuleId);

      const normalizedQuery = this._normalizeQuery(query);

      if (!normalizedQuery) {
        return Promise.resolve({
          query: query || "",
          images: [],
        });
      }

      if (typeof module === "function") {
        return this._searchAsync(module, normalizedQuery, signal);
      }

      return Promise.resolve(this._searchSync(module, normalizedQuery));
    }
  }

  return ImagesResolver;
})();
