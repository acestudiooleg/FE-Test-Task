window.ImagesResolver = (function () {
  class ImagesResolver {
    /**
     * @constructor
     */
    constructor() {

    }

    /**
     * Performs a local search in window.localDB.
     * @param {string} query - The search query.
     * @returns {{query: string, images: Array<{id: number, url: string, tags: string}>}}
     * @private
     */
    _searchLocal(query) {
      /** @type {Array<LocalDBImage>} */
      const localDB = window.localDB || []; // Ensure localDB is an array
      const trimmedQuery = query.trim();
      
      // Moved the empty query check here as it's specific to local search logic as per test1.js
      if (!trimmedQuery) {
        return { query: trimmedQuery, images: [] };
      }
      
      const processedImages = localDB.reduce((acc, image) => {
        // Ensure image.tags is a string before splitting
        if (image.tags && typeof image.tags === 'string' && image.tags.split(', ').includes(trimmedQuery)) {
          acc.push({
            id: image.id,
            url: image.previewURL,
            tags: image.tags
          });
        }
        return acc;
      }, []);

      return {
        query: trimmedQuery,
        images: processedImages
      };
    }

    /**
     * Performs an asynchronous search using the Pixabay API.
     * @param {string} query - The search query.
     * @returns {Promise<{query: string, images: Array<{id: number, url: string, tags: string}>}>}
     * @private
     */
    _searchPixabay(query) {
      const apiKey = '8522875-59a2673910903be627161f155';
      const trimmedQuery = query.trim();
      // image_type=all is added as per pixabay example link in test3.js, ensure per_page=100
      const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(trimmedQuery)}&image_type=all&per_page=100`;

      return fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Pixabay API request failed: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.hits && Array.isArray(data.hits)) {
            const images = data.hits.map(hit => ({
              id: hit.id,
              url: hit.webformatURL, // Pixabay uses webformatURL
              tags: hit.tags,
            }));
            // Ensure exactly 100 results if API provides more for some reason, though per_page should handle this.
            return { query: trimmedQuery, images: images.slice(0, 100) }; 
          } else {
            console.error("Unexpected response format from Pixabay:", data);
            throw new Error('Invalid or unexpected response format from Pixabay API.');
          }
        })
        .catch(error => {
          console.error('Error fetching or processing Pixabay data:', error);
          throw error; // Re-throw to be caught by ImageGallery
        });
    }

    /**
     * Searches for images based on a query.
     * @param {string} query 
     * @param {string} [searchModuleId='local'] - The ID of the search module to use (e.g., 'local', 'pixabay').
     * @returns {object|Promise<object>} For 'local' search, returns result object. For 'pixabay', returns a Promise.
     */
    search(query, searchModuleId = 'local') {
      switch (searchModuleId) {
        case 'local':
          return this._searchLocal(query);
        case 'pixabay':
          return this._searchPixabay(query);
        default:
          throw new Error(`Unsupported searchModuleId: ${searchModuleId}`);
      }
    }
  }

  return ImagesResolver;
})();