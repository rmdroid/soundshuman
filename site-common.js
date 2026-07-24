(function () {
  'use strict';

  document.querySelectorAll('a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || !/\.html(?:[?#].*)?$/.test(href) || /(^|\/)index\.html(?:[?#].*)?$/.test(href)) return;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    if (/(^|\/)(support|impressum|datenschutz|eula)\.html(?:[?#].*)?$/.test(href)) {
      link.setAttribute('data-modal-link', '');
    }
  });

  if (window.self !== window.top) {
    document.documentElement.classList.add('is-embedded');
    return;
  }

  if (!window.soundsHumanModalReady) {
    var sharedModal = document.getElementById('page-modal');
    if (!sharedModal) {
      sharedModal = document.createElement('div');
      sharedModal.className = 'modal-layer';
      sharedModal.id = 'page-modal';
      sharedModal.setAttribute('aria-hidden', 'true');
      sharedModal.innerHTML =
        '<section class="modal" role="dialog" aria-modal="true" aria-label="Information">' +
        '<button class="modal-close" type="button" data-modal-close aria-label="Fenster schließen">×</button>' +
        '<iframe id="page-frame" title="Information" src=""></iframe>' +
        '</section>';
      document.body.appendChild(sharedModal);
    }

    var sharedFrame = sharedModal.querySelector('iframe');
    var sharedClose = sharedModal.querySelector('[data-modal-close]');
    var sharedTrigger = null;
    var sharedBackground = [
      document.querySelector('.site-header') || document.querySelector('.local-nav'),
      document.querySelector('main'),
      document.querySelector('.site-footer') || document.querySelector('footer')
    ].filter(Boolean);

    function setSharedBackgroundInert(inert) {
      sharedBackground.forEach(function (surface) {
        surface.inert = inert;
      });
    }

    function openSharedModal(link) {
      sharedTrigger = link;
      var label = link.textContent.trim() || 'Information';
      sharedFrame.src = link.getAttribute('href');
      sharedFrame.title = label;
      sharedModal.querySelector('.modal').setAttribute('aria-label', label);
      sharedModal.classList.add('open');
      sharedModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      setSharedBackgroundInert(true);
      sharedClose.focus();
    }

    function closeSharedModal() {
      sharedModal.classList.remove('open');
      sharedModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      setSharedBackgroundInert(false);
      window.setTimeout(function () {
        sharedFrame.src = '';
      }, 180);
      if (sharedTrigger) sharedTrigger.focus();
    }

    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[data-modal-link]');
      if (!link) return;
      event.preventDefault();
      openSharedModal(link);
    });

    sharedClose.addEventListener('click', closeSharedModal);
    sharedModal.addEventListener('click', function (event) {
      if (event.target === sharedModal) closeSharedModal();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Tab' && sharedModal.classList.contains('open')) {
        var focusable = [sharedClose, sharedFrame];
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      if (event.key === 'Escape' && sharedModal.classList.contains('open')) {
        closeSharedModal();
      }
    });
    window.soundsHumanModalReady = true;
  }

  var storageKey = 'sounds-human-privacy-notice-v2';
  var notice = document.createElement('aside');
  notice.className = 'cookie-notice';
  notice.setAttribute('aria-label', 'Datenschutzhinweis');
  notice.innerHTML =
    '<p>Diese Website setzt keine Cookies. Besuche werden anonym und cookielos mit Umami und Rybbit ausgewertet. <a href="datenschutz.html" target="_blank" rel="noopener noreferrer" data-modal-link>Details zum Datenschutz</a></p>' +
    '<button type="button">Verstanden</button>';

  var toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.type = 'button';
  toTop.setAttribute('aria-label', 'Nach oben scrollen');
  toTop.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="m6 14 6-6 6 6"></path></svg>';

  function wasAcknowledged() {
    try {
      return window.localStorage.getItem(storageKey) === '1';
    } catch (error) {
      return false;
    }
  }

  if (!wasAcknowledged()) {
    document.body.appendChild(notice);
    toTop.classList.add('is-shifted');
  }

  document.body.appendChild(toTop);

  notice.querySelector('button').addEventListener('click', function () {
    try {
      window.localStorage.setItem(storageKey, '1');
    } catch (error) {
      // The notice can still be dismissed when local storage is unavailable.
    }
    notice.classList.add('is-hiding');
    toTop.classList.remove('is-shifted');
    window.setTimeout(function () {
      notice.hidden = true;
    }, 190);
  });

  function updateToTop() {
    toTop.classList.toggle('is-visible', window.scrollY > 700);
  }

  window.addEventListener('scroll', updateToTop, { passive: true });
  updateToTop();

  toTop.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  });

  var updatesForm = document.getElementById('updates-form');
  if (!updatesForm) return;

  var emailInput = document.getElementById('updates-email');
  var nameInput = document.getElementById('updates-name');
  var submitButton = document.getElementById('updates-submit');
  var status = document.getElementById('updates-status');

  updatesForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    var name = nameInput.value.trim();
    var email = emailInput.value.trim();

    if (!email || !emailInput.checkValidity()) {
      emailInput.setAttribute('aria-invalid', 'true');
      status.textContent = 'Bitte gib eine gültige E-Mail-Adresse ein.';
      status.className = 'form-status error';
      emailInput.focus();
      return;
    }

    emailInput.setAttribute('aria-invalid', 'false');
    submitButton.disabled = true;
    status.textContent = 'Wird übermittelt …';
    status.className = 'form-status';

    var displayName = name || email;
    try {
      var response = await fetch('https://n8n.top-beraternetzwerk.de/webhook/termine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: displayName,
          email: email,
          message: 'Sounds Human Updates / Newsletter\nName: ' + displayName +
            '\nE-Mail: ' + email + '\nQuelle: Sounds Human Updates-Seite\nSeite: ' + window.location.href,
          source: 'sounds-human-updates',
          page: window.location.href,
          interest: 'Sounds Human Updates / Newsletter'
        })
      });

      if (!response.ok) throw new Error('request failed');
      updatesForm.reset();
      status.textContent = 'Danke. Deine Angaben wurden übermittelt.';
      status.className = 'form-status ok';
    } catch (error) {
      status.textContent = 'Das hat gerade nicht funktioniert. Bitte versuche es später noch einmal.';
      status.className = 'form-status error';
    } finally {
      submitButton.disabled = false;
    }
  });

  emailInput.addEventListener('input', function () {
    if (emailInput.getAttribute('aria-invalid') === 'true' && emailInput.checkValidity()) {
      emailInput.setAttribute('aria-invalid', 'false');
    }
  });
}());
