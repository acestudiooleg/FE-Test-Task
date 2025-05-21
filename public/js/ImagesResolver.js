class BaseSearchModule {
  /**
   * Description placeholder
   *
   * @returns {*}
   */
  search(query) {
    throw new Error('"search" method is not implemented');
  }
}

class PixabaySearchModule extends BaseSearchModule {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.controller = null;
  }
  async search(query) {
    const url = `https://pixabay.com/api/?key=${
      this.apiKey
    }&q=${encodeURIComponent(query)}&per_page=100`;

    if (this.controller) {
      this.controller.abort();
    }

    this.controller = new AbortController();

    try {
      const response = await fetch(url, {
        signal: this.controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        query,
        images: (data.hits || []).map(({ id, previewURL, tags }) => ({
          id,
          url: previewURL,
          tags,
        })),
      };
    } catch (error) {
      console.error("Error fetching from Pixabay:", error);
      return { query, images: [] };
    }
  }
}

class LocalSearchModule extends BaseSearchModule {
  search(query) {
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
  }
}

window.ImagesResolver = (function () {
  class ImagesResolver {
    constructor() {
      const PIXABAY_API_KEY = "8522875-59a2673910903be627161f155";

      this.modules = {
        local: new LocalSearchModule(),
        pixabay: new PixabaySearchModule(PIXABAY_API_KEY),
      };
    }

    search(query, searchModuleId = "local") {
      if (!searchModuleId) {
        throw new Error(`Missing required 'searchModuleId' parameter`);
      }
      const module = this.modules[searchModuleId];

      if (!module) {
        throw new Error(`Unknown searchModuleId '${searchModuleId}'`);
      }

      if (!query) return { query, images: [] };

      return module.search(query);
    }
  }

  return ImagesResolver;
})();
