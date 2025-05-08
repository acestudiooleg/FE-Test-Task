window.ImagesResolver = (function () {
  class ImagesResolver {
    constructor() {
      this.validSearchModules = ["local", "pixabay"]; // Define valid search module IDs
      this.PIXABAY_API_KEY = "8522875-59a2673910903be627161f155";
      this.PIXABAY_API_URL = "https://pixabay.com/api/";
    }

    /**
     * Searches for images using the specified search module
     * @param {string} query - Search query or tag to search for
     * @param {string} searchModuleId - ID of the search module to use ('local' or 'pixabay')
     * @param {AbortSignal} signal - Signal object for request cancellation
     * @returns {Promise<Object|null>} Promise resolving to search results
     * @property {string} return.query - The original search query
     * @property {Array<Object>} return.images - Array of found images
     * @property {number} return.images[].id - Image identifier
     * @property {string} return.images[].url - URL of the preview image
     * @property {string} return.images[].tags - Comma-separated list of image tags
     * @returns {null} If the request was aborted
     * @throws {Error} If searchModuleId is not provided
     * @throws {Error} If searchModuleId is not one of the valid modules
     * @throws {Error} If the search operation fails with a non-abort error
     * @public
     */
    async search(query, searchModuleId, signal) {
      if (!searchModuleId) {
        throw new Error(`searchModuleId is not defined`);
      }

      if (!this.validSearchModules.includes(searchModuleId)) {
        throw new Error(
          `Invalid search module ID: ${searchModuleId}. Valid modules are: ${this.validSearchModules.join(
            ", "
          )}`
        );
      }

      let filteredImages = [];

      try {
        switch (searchModuleId) {
          case "local":
            filteredImages = this._getFromLocalDB(query);
            break;

          case "pixabay":
            const pixabayImages = await this._fetchFromPixabay(query, { signal });
            // If request was aborted, don't process results
            if (pixabayImages === null) {
              return null;
            }
            filteredImages = pixabayImages;
            break;

          default:
            filteredImages = [];
        }

        return {
          query: query,
          images: filteredImages,
        };
      } catch (error) {
        if (error.name === "AbortError") {
          return null;
        }

        throw error;
      }
    }

    /**
     * Searches for images in the local database by tags
     * @param {string} query - Tag to search for
     * @returns {Array<Object>} Array of image objects
     * @property {number} return[].id - Image identifier
     * @property {string} return[].url - URL of the preview image
     * @property {string} return[].tags - Comma-separated list of image tags
     * @private
     */
    _getFromLocalDB(query) {
      return window.localDB
        .filter(image => {
          const tags = image.tags.split(",").map(tag => tag.trim());
          return tags.includes(query);
        })
        .map(image => ({
          id: image.id,
          url: image.previewURL,
          tags: image.tags,
        }));
    }

    /**
     * Makes a request to Pixabay API
     * @param {string} query - Search query for images
     * @param {Object} options - Fetch options
     * @param {AbortSignal} options.signal - AbortController signal for cancelling the request
     * @returns {Promise<Array<Object>|null>} Promise resolving to:
     * @property {number} return[].id - Image identifier
     * @property {string} return[].url - URL of the preview image
     * @property {string} return[].tags - Comma-separated list of image tags
     * @returns {null} If the request was aborted
     * @returns {Array<Object>} Empty array if there was an error or no results
     * @throws {Error} If the HTTP request fails with a non-abort error
     * @private
     */
    async _fetchFromPixabay(query, options) {
      try {
        const params = new URLSearchParams({
          key: this.PIXABAY_API_KEY,
          q: query,
          image_type: "photo",
          page: "1",
          per_page: "100",
        });

        const response = await fetch(`${this.PIXABAY_API_URL}?${params.toString()}`, options);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return data.hits.map(hit => ({
          id: hit.id,
          url: hit.previewURL,
          tags: hit.tags,
        }));
      } catch (error) {
        if (error.name === "AbortError") {
          // Ignore abort errors
          return null;
        }
        console.error("Error fetching from Pixabay:", error);
        return [];
      }
    }
  }

  return ImagesResolver;
})();
