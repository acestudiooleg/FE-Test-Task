window.ImageGallery = (function () {
  class ImageGallery {
    /**
     * @constructor
     * @param {ImagesResolver} imagesResolver
     */
    constructor(imagesResolver) {
      this.imagesResolver = imagesResolver;
      this.abortController = null;
      this.apiArray = ["pixabay"];
      this._initView();
      this._initViewFunctionality();
    }

    /**
     * @param {String} query
     */
    search(query, searchModuleId) {
      const isAbortable = this.apiArray.includes(searchModuleId);

      this.abortController?.abort();
      this.abortController = isAbortable ? new AbortController() : null;

      this.imagesResolver
        .search(query, `${searchModuleId}DB`, this.abortController?.signal)
        .then((data) => this._onReceiveSearchResult(data))
        .catch((err) => {
          if (err.name === "AbortError") {
            return;
          }
          console.error(err);
        });
    }

    addToElement(element) {
      element.appendChild(this.container);
    }

    _onUserSearch(ev) {
      ev.preventDefault();
      this.search(this.seachInput.value, this.selectInput.value);
    }

    _onReceiveSearchResult(result) {
      this.searchResults.innerHTML = "";
      const imagesInfo = result.images;

      imagesInfo.forEach((image) => {
        const imgNode = document.createElement("img");
        imgNode.setAttribute("src", image.url);
        this.searchResults.appendChild(imgNode);
      });
    }

    _initView() {
      const options = [
        { value: "local", label: "Local" },
        { value: "pixabay", label: "Pixabay" },
      ];

      this.container = document.createElement("div");
      this.container.className = "gallery";

      this.form = document.createElement("form");
      this.form.className = "gallery__form form-inline";
      this.container.appendChild(this.form);

      this.formGroup = document.createElement("div");
      this.formGroup.className = "form-group";
      this.form.appendChild(this.formGroup);

      this.selectInput = document.createElement("select");
      this.selectInput.className = "gallery__search form-control";

      options.forEach(({ value, label }) => {
        const option = document.createElement("option");
        option.value = value;
        option.innerText = label;
        this.selectInput.appendChild(option);
      });

      this.formGroup.appendChild(this.selectInput);

      this.seachInput = document.createElement("input");
      this.seachInput.className = "gallery__search form-control";
      this.seachInput.placeholder = "search by tag";
      this.formGroup.appendChild(this.seachInput);

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
