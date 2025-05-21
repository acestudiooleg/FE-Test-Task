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
    }

    /**
     * @param {String} query
     * @param {String} searchModuleId
     */
    search(query, searchModuleId) {
      const searchResults = this.imagesResolver.search(query, searchModuleId);
      if (searchResults instanceof Promise) {
        searchResults.then((data) => {
          this._onReceiveSearchResult(data);
        });
      } else {
        this._onReceiveSearchResult(searchResults);
      }
    }

    addToElement(element) {
      element.appendChild(this.container);
    }

    _onUserSearch(ev) {
      ev.preventDefault();
      this.search(this.seachInput.value, this.selectModule.value);
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

      this.selectModule = document.createElement("select");
      ["local", "pixabay"].forEach((module) => {
        const option = document.createElement("option");
        option.value = module;
        option.textContent = module;
        this.selectModule.appendChild(option);
      });
      this.selectModule.className = "form-control mr-3";
      this.formGroup.appendChild(this.selectModule);

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
