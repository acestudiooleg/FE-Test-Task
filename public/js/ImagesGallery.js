window.ImageGallery = (function () {
  class ImageGallery {
    /**
     * @constructor
     * @param {ImagesResolver} imagesResolver - An instance of ImagesResolver.
     */
    constructor(imagesResolver) {
      this.imagesResolver = imagesResolver;
      this.currentSearchQuery = null;
      this.currentSearchModuleId = null;
      this._initView();
      this._initViewFunctionality();
    }

    /**
     * Searches for images based on a query and updates the gallery.
     * @param {String} query - The search query.
     * @param {String} searchModuleId - The ID of the search module to use. Must be defined.
     * @throws {Error} if searchModuleId is not defined.
     */
    search(query, searchModuleId) {
      if (typeof searchModuleId === 'undefined') {
        throw new Error("searchModuleId must be defined.");
      }

      this.currentSearchQuery = query;
      this.currentSearchModuleId = searchModuleId;

      try {
        const resultOrPromise = this.imagesResolver.search(query, searchModuleId);

        if (resultOrPromise instanceof Promise) {
          this.searchResults.innerHTML = '<div class="loading">Loading results...</div>';
          resultOrPromise
            .then(results => {
              if (results.query === this.currentSearchQuery && searchModuleId === this.currentSearchModuleId) {
                this._onReceiveSearchResult(results);
              }
            })
            .catch(error => {
              if (query === this.currentSearchQuery && searchModuleId === this.currentSearchModuleId) {
                console.error('Error during async search:', error);
                this.searchResults.innerHTML = `<div class="alert alert-danger">Search error: ${error.message}</div>`;
              }
            });
        } else {
          this._onReceiveSearchResult(resultOrPromise);
        }
      } catch (error) {
        console.error('Error during search setup or synchronous search:', error);
        this.searchResults.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        throw error;
      }
    }

    /**
     * Appends the gallery container to a given HTML element.
     * @param {HTMLElement} element - The HTML element to append the gallery to.
     */
    addToElement(element) {
      element.appendChild(this.container);
    }

    /**
     * Handles the user search event.
     * @param {Event} ev - The event object.
     * @private
     */
    _onUserSearch(ev) {
      ev.preventDefault();
      const query = this.seachInput.value;
      const searchModuleId = this.searchModuleSelect.value;
      this.search(query, searchModuleId);
    }

    /**
     * Handles the received search result and updates the gallery.
     * @param {{query: string, images: Array<{id: number, url: string, tags: string}>}} result - The search result object.
     * @private
     */
    _onReceiveSearchResult(result) {
      this.searchResults.innerHTML = "";
      const imagesInfo = result.images;

      if (imagesInfo && imagesInfo.length > 0) {
        imagesInfo.forEach((image) => {
          const imgNode = document.createElement('img');
          imgNode.setAttribute('src', image.url);
          imgNode.setAttribute('alt', image.tags || 'Search result');
          this.searchResults.appendChild(imgNode);
        });
      } else {
        this.searchResults.innerHTML = '<div class="no-results">No images found.</div>';
      }
    }

    /**
     * Initializes the gallery view elements.
     * @private
     */
    _initView() {
      this.container = document.createElement("div");
      this.container.className = "gallery";

      this.form = document.createElement("form");
      this.form.className = "gallery__form form-inline mb-3";
      this.container.appendChild(this.form);

      this.formGroup = document.createElement("div");
      this.formGroup.className = "form-group mr-2";
      this.form.appendChild(this.formGroup);

      this.seachInput = document.createElement("input");
      this.seachInput.className = "gallery__search form-control";
      this.seachInput.placeholder = "search by tag";
      this.formGroup.appendChild(this.seachInput);

      this.searchModuleSelect = document.createElement("select");
      this.searchModuleSelect.className = "gallery__module form-control mr-2";
      
      const localOption = document.createElement("option");
      localOption.value = "local";
      localOption.textContent = "Local";
      this.searchModuleSelect.appendChild(localOption);
      
      const pixabayOption = document.createElement("option");
      pixabayOption.value = "pixabay";
      pixabayOption.textContent = "Pixabay";
      this.searchModuleSelect.appendChild(pixabayOption);
      
      this.formGroup.appendChild(this.searchModuleSelect);

      this.searchButton = document.createElement("button");
      this.searchButton.type = "submit";
      this.searchButton.className = "gallery__button btn btn-primary";
      this.searchButton.innerText = "Search";
      this.form.appendChild(this.searchButton);

      this.searchResults = document.createElement("div");
      this.searchResults.className = "gallery__result mt-3";
      this.container.appendChild(this.searchResults);
    }

    /**
     * Initializes the gallery view functionality (event listeners).
     * @private
     */
    _initViewFunctionality() {
      this.form.addEventListener("submit", this._onUserSearch.bind(this));
    }
  }

  return ImageGallery;
})();