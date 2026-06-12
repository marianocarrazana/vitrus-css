function getSections() {
  return [...document.querySelectorAll('main.docs-main section.docs-section[id]')].filter((section) =>
    section.querySelector('h2.docs-section-title'),
  );
}

function getSectionLabel(section) {
  const textEl = section.querySelector('.docs-section-title-text');
  const title = textEl ?? section.querySelector('h2.docs-section-title');
  if (!title) return section.id;
  return title.textContent.replace(/\s+/g, ' ').trim();
}

function createTocLink(section) {
  const link = document.createElement('a');
  link.className = 'docs-toc-link';
  link.href = `#${section.id}`;
  link.textContent = getSectionLabel(section);
  return link;
}

function buildToc() {
  const desktop = document.getElementById('docs-toc-list');
  const mobile = document.getElementById('docs-toc-panel');
  if (!desktop || !mobile) return [];

  desktop.replaceChildren();
  mobile.replaceChildren();

  const sections = getSections();
  const links = sections.map((section) => {
    const desktopLink = createTocLink(section);
    const mobileLink = createTocLink(section);
    desktop.appendChild(desktopLink);
    mobile.appendChild(mobileLink);
    return { section, desktopLink, mobileLink };
  });

  return links;
}

function initScrollSpy(links) {
  if (!links.length || !('IntersectionObserver' in window)) return;

  const setActive = (id) => {
    links.forEach(({ section, desktopLink, mobileLink }) => {
      const active = section.id === id;
      desktopLink.classList.toggle('active', active);
      mobileLink.classList.toggle('active', active);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length > 0) {
        setActive(visible[0].target.id);
      }
    },
    {
      rootMargin: '-20% 0px -65% 0px',
      threshold: [0, 0.1, 0.25, 0.5],
    },
  );

  links.forEach(({ section }) => observer.observe(section));
}

function initTocLinkClose() {
  const panel = document.getElementById('docs-toc-panel');
  if (!panel) return;

  panel.addEventListener('click', (event) => {
    const link = event.target.closest('a.docs-toc-link');
    if (!link || !panel.classList.contains('show')) return;

    if (window.vitrus?.Collapse) {
      window.vitrus.Collapse.getOrCreateInstance(panel)?.hide();
    }
  });
}

const links = buildToc();
initScrollSpy(links);
initTocLinkClose();
