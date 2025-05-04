// Lista di film/serie TV (puoi collegarla a un file JSON o API)
const featuredContent = [...filmContent, ...serieContent];

// Poi usa `featuredContent` normalmente per il rendering
// renderCatalog(); // o altra tua funzione
document.addEventListener("DOMContentLoaded", () => {
    if (typeof renderCatalog === "function") {
      renderCatalog(); // ora eseguito solo quando tutto è caricato
    } else {
      console.warn("renderCatalog non è ancora definito.");
    }
  });