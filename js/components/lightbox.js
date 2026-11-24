const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('.lightbox__img');
const lightboxText = lightbox.querySelector('.lightbox__text');

lightbox.addEventListener('click', close);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') close();
});

// Opens the photo, or the photo next to a text when `label` and `textNode` are given.
function open(src, label = '', textNode = null) {
  lightboxImg.src = src;
  lightboxText.innerHTML = '';
  lightbox.classList.toggle('lightbox--with-text', Boolean(textNode));
  if (textNode) {
    const badge = document.createElement('div');
    badge.className = 'study__image-badge';
    badge.textContent = label;
    lightboxText.append(badge, textNode);
    lightboxText.scrollTop = 0;
  }
  lightbox.classList.add('lightbox--visible');
  document.body.style.overflow = 'hidden';
}

function close() {
  lightbox.classList.remove('lightbox--visible');
  document.body.style.overflow = '';
}

export { open as openLightbox };
