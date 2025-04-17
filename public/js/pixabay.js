window.pixabayDB = async function (query, signal) {
  if (!query) return [];

  // Normally the API key should be in a .env file, but it's not required in this test task.
  const API_KEY = "8522875-59a2673910903be627161f155";
  const URL = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&per_page=100`;

  try {
    const response = await fetch(URL, { signal });
    const data = await response.json();

    return data.hits.map((image) => ({
      id: image.id,
      url: image.previewURL,
      tags: image.tags,
    }));
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }
    console.error("Pixabay error:", error);
    return [];
  }
};
