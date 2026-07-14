import { STORAGE_KEYS } from './constants.js';
import { setStringToStorage } from './storage.js';

export function initSearchRedirect(destination = 'index.html') {
  const searchInput = document.querySelector('.js-search-bar');
  const searchButton = document.querySelector('.js-search-button');

  if (!searchInput) {
    return;
  }

  const redirectWithSearch = () => {
    setStringToStorage(STORAGE_KEYS.LAST_SEARCH, searchInput.value);
    window.location.href = destination;
  };

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      redirectWithSearch();
    }
  });

  if (searchButton) {
    searchButton.addEventListener('click', redirectWithSearch);
  }
}
