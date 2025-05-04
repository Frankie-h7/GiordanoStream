// Main JavaScript

window.addEventListener('load', () => {
  const offlineOverlay = document.getElementById('offline-overlay');

  // Funzione che controlla la connessione
  function checkConnection() {
    if (!navigator.onLine) {
      // Se l'utente è offline, mostra l'overlay
      offlineOverlay.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Blocca lo scorrimento della pagina
    } else {
      // Se l'utente è online, nascondi l'overlay
      offlineOverlay.style.display = 'none';
      document.body.style.overflow = 'auto'; // Rende di nuovo possibile lo scorrimento
    }
  }

    // Esegui subito il controllo della connessione quando la pagina è caricata
    checkConnection();

    // Aggiungi gli eventi per monitorare quando la connessione cambia
    window.addEventListener('offline', checkConnection); // Quando si va offline
    window.addEventListener('online', checkConnection);  // Quando si va online
  });

// CARD FOR CONTENT
// Funzione per creare una card (versione migliorata)
function createCard(item) {
  const card = document.createElement('div');
  card.classList.add('card');
  
  const isFav = isFavorite(item);
  
  // Struttura della card con pulsante preferiti
  card.innerHTML = `
    <div class="card-image-container">
      <img src="${item.image}" alt="${item.title}" class="card-image" />
      <button class="fav-btn ${isFav ? 'active' : ''}" aria-label="${isFav ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}">
        ${isFav ? '⭐' : '☆'}
      </button>
    </div>
    <div class="card-body">
      <h3 class="card-title">${item.title}</h3>
      <p class="card-description">${item.description}</p>
    </div>
  `;
  
  // Gestione click sulla card (escluso il pulsante preferiti)
  card.addEventListener('click', (e) => {
    // Verifica se il click è avvenuto sul pulsante preferiti
    if (!e.target.closest('.fav-btn')) {
      if (item.seasons) {
        renderSeriePage(item);
      } else {
        openVideoModal(item.title, item.videoUrl);
      }
    }
  });
  
  // Gestione click sul pulsante preferiti
  const favBtn = card.querySelector('.fav-btn');
  favBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(item);
    updateFavButton(favBtn, item);
  });
  
  return card;
}

// Aggiorna lo stato del pulsante preferiti
function updateFavButton(btn, item) {
  const nowFavorite = isFavorite(item);
  btn.classList.toggle('active', nowFavorite);
  btn.textContent = nowFavorite ? '⭐' : '☆';
  btn.setAttribute('aria-label', nowFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti');
  btn.classList.add('animate');
  setTimeout(() => btn.classList.remove('animate'), 300);
}

  // Funzioni per gestire i Preferiti
  function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  }
  
// Modifica anche la funzione isFavorite per usare lo stesso criterio
function isFavorite(item) {
  const favorites = getFavorites();
  return favorites.some(fav => 
      fav.title === item.title && fav.image === item.image
  );
}
  
// Modifica la funzione toggleFavorite così:
function toggleFavorite(item) {
  let favorites = getFavorites();
  
  // Crea una versione semplificata dell'item da salvare
  const favItem = {
      title: item.title,
      description: item.description,
      image: item.image,
      videoUrl: item.videoUrl || (item.seasons?.[0]?.episodes?.[0]?.videoUrl || '') // Prende il primo episodio se è una serie
  };

  // Verifica se esiste già un preferito con lo stesso titolo E immagine
  const existingIndex = favorites.findIndex(fav => 
      fav.title === item.title && fav.image === item.image
  );

  if (existingIndex >= 0) {
      // Rimuovi se già presente
      favorites.splice(existingIndex, 1);
  } else {
      // Aggiungi il nuovo preferito semplificato
      favorites.push(favItem);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  // Aggiorna la vista se siamo nella sezione preferiti
  if (document.getElementById('nav-preferiti').classList.contains('active')) {
      updateFavoritesView();
  }
}

// Aggiungi questa funzione helper
function updateFavoritesView() {
  const favorites = getFavorites();
  const container = document.querySelector('.content');
  container.innerHTML = `
      <h2>Preferiti ⭐</h2>
      <div class="card-container" id="featured-container"></div>
  `;
  const target = document.getElementById('featured-container');
  
  if (favorites.length > 0) {
      favorites.forEach(item => {
          const card = createCard(item);
          target.appendChild(card);
      });
  } else {
      target.innerHTML = "<p>Non hai ancora aggiunto contenuti ai preferiti.</p>";
  }
}
  

  
  // Inserimento nel DOM
  const container = document.getElementById('featured-container');
  featuredContent.forEach(item => {
    const card = createCard(item);
    container.appendChild(card);
  });
  
  // Modal video player (semplice)
  function openVideoModal(title, videoUrl) {
    const modal = document.createElement('div');
    modal.classList.add('video-modal');
  
    modal.innerHTML = `
      <div class="video-wrapper">
        <h2>${title}</h2>
        <video id="player" playsinline controls>
          <source src="${videoUrl}" type="video/mp4" />
        </video>
        <button class="close-btn">Chiudi</button>
      </div>
    `;
  
    document.body.appendChild(modal);
  
    const player = new Plyr('#player', {
      controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen']
    });
  
    modal.querySelector('.close-btn').addEventListener('click', () => {
      player.destroy();
      modal.remove();
    });
  }  

  /* Mostra il catalogo sulla home */
  function renderCatalog() {
    const container = document.getElementById('featured-container');
    container.innerHTML = '';
    featuredContent.forEach(item => {
      const card = createCard(item); // ✅ Usa la funzione corretta!
      container.appendChild(card);
    });
  }
  
        // Fai reagire tutta la card al click, non il bottone "Guarda"


  /* Visualizza pagina episodi per una serie */
  function renderSeriePage(serie) {
    const contentSection = document.querySelector('.content');
    contentSection.innerHTML = `
      <h2>${serie.title}</h2>
      <p>${serie.description}</p>
      ${serie.seasons.map(season => `
        <h3>Stagione ${season.season}</h3>
        <div class="episode-list">
          ${season.episodes.map(episode => `
            <button class="episode-btn">${episode.title}</button>
          `).join('')}
        </div>
      `).join('')}
      
      <button class="back-btn">🔙 Torna al catalogo</button>
    `;
  
    let i = 0;
    serie.seasons.forEach(season => {
      season.episodes.forEach(episode => {
        const btn = contentSection.querySelectorAll('.episode-btn')[i];
        btn.addEventListener('click', () => {
          openVideoModal(episode.title, episode.videoUrl);
        });
        i++;
      });
    });
  
    contentSection.querySelector('.back-btn').addEventListener('click', () => {
      document.querySelector('.content').innerHTML = `
        <h2>In evidenza</h2>
        <div class="card-container" id="featured-container"></div>
      `;
      renderCatalog();  // reinizializza
    });
  }

  /* __________________________
     __________________________*/
  // Cambio Pagina Dinamicamente
  document.addEventListener('DOMContentLoaded', () => {
    renderCatalog(); // mostra contenuto iniziale
  
    // Pulsanti navigazione
    document.getElementById('nav-home').addEventListener('click', () => {
      document.querySelector('.content').innerHTML = `
        <h2>In evidenza</h2>
        <div class="card-container" id="featured-container"></div>
      `;
      renderCatalog();
    });
  
    document.getElementById('nav-film').addEventListener('click', () => {
      renderFiltered('film');
    });
  
    document.getElementById('nav-serie').addEventListener('click', () => {
      renderFiltered('serie');
    });

      document.getElementById('nav-preferiti').addEventListener('click', () => {
        const favorites = getFavorites();
        const container = document.querySelector('.content');
        container.innerHTML = `
          <h2>Preferiti ⭐</h2>
          <div class="card-container" id="featured-container"></div>
        `;
        const target = document.getElementById('featured-container');
        if (favorites.length > 0) {
          favorites.forEach(item => {
            const card = createCard(item); // Crea le card per ogni preferito
            target.appendChild(card);
          });
        } else {
          target.innerHTML = '<p class="no-favorites-msg">Non hai ancora aggiunto contenuti ai preferiti.</p>';
        }
      });

  // Esempio: filtro per tipo
  function renderFiltered(tipo) {
    const filtered = featuredContent.filter(item =>
      tipo === 'film' ? !item.seasons : item.seasons
    );
    const container = document.querySelector('.content');
    container.innerHTML = `
      <h2>${tipo === 'film' ? 'Film' : 'Serie TV'}</h2>
      <div class="card-container" id="featured-container"></div>
    `;
    const target = document.getElementById('featured-container');
    filtered.forEach(item => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      `;
      card.addEventListener('click', () => {
        if (item.seasons) {
          renderSeriePage(item);
        } else {
          openVideoModal(item.title, item.videoUrl);
        }
      });
      target.appendChild(card);
    });
  }
  
  
  
  
  // Modal Style
  const style = document.createElement('style');
  style.textContent = `
.video-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0;
}

.video-wrapper {
  width: 90vw;
  height: 80vh;
  max-width: 1200px;
  background: #111;
  border-radius: 10px;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-wrapper h2 {
  color: #fff;
  margin-bottom: 1rem;
}

.video-wrapper video {
  width: 100%;
  height: 100%;
  object-fit: cover !important;
  border-radius: 8px;
}

.close-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #ff3c3c;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  font-weight: bold;
}
`;
  document.head.appendChild(style);  

  document.addEventListener('DOMContentLoaded', () => {
    renderCatalog();
  });
});

// Service Worker funzionante
// Registrazione Service Worker (versione migliorata)
const registerServiceWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.register(
      '/GiordanoMusic.github.io/service-worker.js', 
      {
        scope: '/GiordanoMusic.github.io/',
        updateViaCache: 'none' // Importante per aggiornamenti immediati
    });
    
    // ... resto del codice invariato ...
    console.log('✅ Service Worker registrato con scope:', registration.scope);

    // Controlla aggiornamenti
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          console.log('🔄 Nuova versione disponibile!');
          // Opzionale: Notifica l'utente per ricaricare
          if (confirm('Nuovo aggiornamento disponibile! Ricaricare ora?')) {
            window.location.reload();
          }
        }
      });
    });

  } catch (error) {
    console.error('❌ Registrazione fallita:', error);
  }
};

// Esegui solo se supportato
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', registerServiceWorker);
  
  // Controlla aggiornamenti ogni 24 ore
  setInterval(() => {
    navigator.serviceWorker.getRegistration()?.update();
  }, 86400000);
}