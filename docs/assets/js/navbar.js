document.querySelectorAll('[data-vitrus-toggle="collapse"]').forEach((toggler) => {
  const targetSelector = toggler.getAttribute('data-vitrus-target');
  if (!targetSelector) return;

  const target = document.querySelector(targetSelector);
  if (!target) return;

  toggler.addEventListener('click', () => {
    const isOpen = target.classList.contains('show');
    target.classList.toggle('show', !isOpen);
    toggler.setAttribute('aria-expanded', String(!isOpen));
  });
});
