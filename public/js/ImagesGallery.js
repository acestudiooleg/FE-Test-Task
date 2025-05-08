window.ImageGallery = (function () {
  class ImageGallery {
    /**
     * @constructor
     * @param {ImagesResolver} imagesResolver
     */
    constructor(imagesResolver) {
      this.imagesResolver = imagesResolver;
      this._initView();
      this._initViewFunctionality();
      this.currentController = null; // Track current search for THIS gallery instance
    }

    /**
     * Performs an image search and updates the gallery view
     * @async
     * @param {string} query - The search term to look for
     * @param {string} searchModuleId - The search module to use ('local' or 'pixabay')
     * @returns {Promise<void>}
     * @throws {Error} If searchModuleId is invalid or not provided
     * @throws {Error} If the search operation fails with a non-abort error
     * @description
     * This method:
     * 1. Cancels any ongoing search for this gallery instance
     * 2. Creates a new AbortController for the current search
     * 3. Performs the search using ImagesResolver
     * 4. Updates the gallery UI with results if the search wasn't aborted
     * @example
     * await gallery.search("cats", "pixabay");
     * await gallery.search("dogs", "local");
     */
    async search(query, searchModuleId) {
      try {
        // Handle search abortion
        this._abortPreviousSearch();
        const signal = this._createNewSearchSignal();

        const searchResults = await this.imagesResolver.search(
          query,
          searchModuleId,
          this.currentController.signal
        );

        // Only update UI if we got results (not aborted)
        if (searchResults !== null) {
          this._onReceiveSearchResult(searchResults);
        }
      } catch (e) {
        if (error.name !== "AbortError") {
          console.error("Search failed:", error);
        }

        throw error;
      }
    }

    addToElement(element) {
      element.appendChild(this.container);
    }

    /**
     * Aborts previous search if exists
     * @private
     */
    _abortPreviousSearch() {
      if (this.currentController) {
        this.currentController.abort();
        this.currentController = null;
      }
    }

    /**
     * Creates new AbortController for current search
     * @private
     * @returns {AbortSignal}
     */
    _createNewSearchSignal() {
      this.currentController = new AbortController();
      return this.currentController.signal;
    }

    _onUserSearch(ev) {
      ev.preventDefault();
      this.search(this.seachInput.value, this.select.value);
    }

    _onReceiveSearchResult(result) {
      this.searchResults.innerHTML = "";
      const imagesInfo = result.images;

      imagesInfo.forEach(image => {
        const imgNode = document.createElement("img");
        imgNode.setAttribute("src", image.url);
        this.searchResults.appendChild(imgNode);
      });
    }

    _initView() {
      this.container = document.createElement("div");
      this.container.className = "gallery";

      this.form = document.createElement("form");
      this.form.className = "gallery__form form-inline";
      this.container.appendChild(this.form);

      this.formGroup = document.createElement("div");
      this.formGroup.className = "form-group";
      this.form.appendChild(this.formGroup);

      this.seachInput = document.createElement("input");
      this.seachInput.className = "gallery__search form-control";
      this.seachInput.placeholder = "search by tag";
      this.formGroup.appendChild(this.seachInput);

      this.select = document.createElement("select");
      this.select.className = "gallery__select form-control";
      this.select.innerHTML = `
        <option value="local">Local</option>
        <option value="pixabay">pixabay</option>
      `;
      this.form.appendChild(this.select);

      this.searchButton = document.createElement("button");
      this.searchButton.className = "gallery__button btn btn-primary";
      this.searchButton.innerText = "search";
      this.form.appendChild(this.searchButton);

      this.searchResults = document.createElement("div");
      this.searchResults.className = "gallery__result";
      this.container.appendChild(this.searchResults);
    }

    _initViewFunctionality() {
      this.form.addEventListener("submit", this._onUserSearch.bind(this));
    }
  }

  return ImageGallery;
})();
