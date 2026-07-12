export function handleImageError(event) {
  const image = event.target;
  image.onerror = null;
  image.classList.add('image-error');
  image.alt = 'Image unavailable';
}
