import {
  getStringFromStorage,
  getJsonFromStorage,
} from '../shared/storage.js';
import { STORAGE_KEYS, FILTER_DEFAULTS } from '../shared/constants.js';

export const filterState = {
  searchQuery: getStringFromStorage(STORAGE_KEYS.LAST_SEARCH),
  selectedCategory: FILTER_DEFAULTS.category,
  priceRange: FILTER_DEFAULTS.priceRange,
  sortBy: FILTER_DEFAULTS.sortBy,
};

export let recentSearches = getJsonFromStorage(STORAGE_KEYS.RECENT_SEARCHES);
export let favorites = getJsonFromStorage(STORAGE_KEYS.FAVORITES);

export function resetFilterState() {
  filterState.searchQuery = '';
  filterState.selectedCategory = FILTER_DEFAULTS.category;
  filterState.priceRange = FILTER_DEFAULTS.priceRange;
  filterState.sortBy = FILTER_DEFAULTS.sortBy;
}

export function hasActiveFilters() {
  return (
    filterState.searchQuery !== '' ||
    filterState.selectedCategory !== FILTER_DEFAULTS.category ||
    filterState.priceRange !== FILTER_DEFAULTS.priceRange ||
    filterState.sortBy !== FILTER_DEFAULTS.sortBy
  );
}

export function setFavorites(nextFavorites) {
  favorites = nextFavorites;
}

export function setRecentSearches(nextRecentSearches) {
  recentSearches = nextRecentSearches;
}
