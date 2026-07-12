import {
  MAX_RECENT_SEARCHES,
  STORAGE_KEYS,
} from '../shared/constants.js';
import {
  getJsonFromStorage,
  setJsonToStorage,
  setStringToStorage,
} from '../shared/storage.js';
import { setRecentSearches } from './filterState.js';

export function createRecentSearchManager({
  dropdownElement,
  searchInput,
  clearButton,
  onSearchSelect,
}) {
  let recentSearches = getJsonFromStorage(STORAGE_KEYS.RECENT_SEARCHES);

  function renderDropdown() {
    if (recentSearches.length === 0) {
      dropdownElement.classList.add('hidden');
      return;
    }

    let dropdownHTML = '';
    recentSearches.forEach((item, index) => {
      dropdownHTML += `
        <div class="dropdown-item js-dropdown-item" data-index="${index}" data-query="${item}">
          <div class="dropdown-item-text">
            <span class="dropdown-item-icon"></span>
            <span>${item}</span>
          </div>
          <button class="remove-recent-button js-remove-recent" data-index="${index}">&times;</button>
        </div>`;
    });

    dropdownElement.innerHTML = dropdownHTML;

    dropdownElement.querySelectorAll('.js-dropdown-item').forEach((item) => {
      item.addEventListener('mousedown', () => {
        const query = item.dataset.query;
        searchInput.value = query;
        clearButton.classList.remove('hidden');
        setStringToStorage(STORAGE_KEYS.LAST_SEARCH, query);
        onSearchSelect(query);
      });
    });

    dropdownElement.querySelectorAll('.js-remove-recent').forEach((button) => {
      button.addEventListener('mousedown', (event) => {
        event.stopPropagation();
        event.preventDefault();
        const index = Number(button.dataset.index);
        recentSearches.splice(index, 1);
        setJsonToStorage(STORAGE_KEYS.RECENT_SEARCHES, recentSearches);
        setRecentSearches(recentSearches);
        renderDropdown();
        searchInput.focus();
      });
    });
  }

  function addToRecentSearches(query) {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return;
    }

    recentSearches = recentSearches.filter(
      (search) => search.toLowerCase() !== cleanQuery.toLowerCase()
    );
    recentSearches.unshift(cleanQuery);

    if (recentSearches.length > MAX_RECENT_SEARCHES) {
      recentSearches.pop();
    }

    setJsonToStorage(STORAGE_KEYS.RECENT_SEARCHES, recentSearches);
    setRecentSearches(recentSearches);
    renderDropdown();
  }

  function showDropdown() {
    if (recentSearches.length > 0) {
      renderDropdown();
      dropdownElement.classList.remove('hidden');
    }
  }

  function hideDropdown() {
    dropdownElement.classList.add('hidden');
  }

  return {
    addToRecentSearches,
    showDropdown,
    hideDropdown,
  };
}
