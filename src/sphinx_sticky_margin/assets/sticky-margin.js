document.addEventListener('DOMContentLoaded', function () {
  var handledFigures = new WeakSet();

  document.querySelectorAll('.sticky-margin').forEach(function (marker) {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var mainFigure = marker.tagName === 'FIGURE' ? marker : marker.closest('figure');

    if (!mainFigure || handledFigures.has(mainFigure)) return;
    handledFigures.add(mainFigure);

    var aside = document.createElement('aside');
    aside.className = 'margin sidebar sticky-margin sticky-margin-generated';
    aside.innerHTML = '<p class="sidebar-title"></p>';

    var figureClone = mainFigure.cloneNode(true);
    aside.appendChild(figureClone);

    // Walk up from the figure to .bd-article. If any ancestor has non-visible
    // overflow (hidden, clip, scroll, auto) it will constrain position:sticky
    // or clip the aside — so insert after the outermost such ancestor instead.
    // This handles admonitions, sd-cards, dropdowns, details, tabs, etc.
    // generically without needing to enumerate their class names.
    var articleEl = document.querySelector('.bd-article') || document.body;
    var insertAfter = mainFigure;
    var el = mainFigure.parentElement;
    while (el && el !== articleEl) {
      var ovStyle = window.getComputedStyle(el);
      if (ovStyle.overflow !== 'visible' || ovStyle.overflowX !== 'visible' || ovStyle.overflowY !== 'visible') {
        insertAfter = el;
      }
      el = el.parentElement;
    }
    insertAfter.insertAdjacentElement('afterend', aside);

    function ensureMathVisible() {
      // Clear any hidden styles on math elements and MathJax containers
      aside.querySelectorAll('.math').forEach(function(m) { m.style.display = ''; });
      aside.querySelectorAll('mjx-container').forEach(function(mjx) {
        mjx.style.visibility = '';
        mjx.style.display = '';
      });
    }

    var sourceImage = mainFigure.querySelector('.sticky-margin') || mainFigure.querySelector('img');
    var targetImage = aside.querySelector('img');
    var lastSourceRect = null;
    var currentFlightAnimation = null;
    var hideTimeoutId = null;
    var allowFlightAnimation = false;
    var initialScrollY = window.scrollY;

    aside.style.transition = 'opacity 150ms ease-in-out';

    function typesetAsideMath() {
      if (!aside.classList.contains('is-visible')) {
        return;
      }

      ensureMathVisible();

      if (!window.MathJax || typeof window.MathJax.typesetPromise !== 'function') {
        return;
      }

      function runTypeset() {
        if (!aside.classList.contains('is-visible')) {
          return;
        }

        window.MathJax.typesetPromise([aside]).then(function () {
          ensureMathVisible();
        }).catch(function () {
          // Ignore transient MathJax failures.
        });
      }

      if (window.MathJax.startup && window.MathJax.startup.promise) {
        window.MathJax.startup.promise.then(runTypeset).catch(function () {});
      } else {
        requestAnimationFrame(runTypeset);
      }
    }

    function cancelPendingHide() {
      if (hideTimeoutId) {
        clearTimeout(hideTimeoutId);
        hideTimeoutId = null;
      }

      aside.style.opacity = '1';
    }

    function cancelCurrentFlight() {
      if (currentFlightAnimation) {
        currentFlightAnimation.cancel();
        currentFlightAnimation = null;
      }
    }

    function createFlightClone(image, rect) {
      var clone = image.cloneNode(true);
      clone.className = image.className;
      clone.classList.add('sticky-margin-flight');
      clone.style.left = rect.left + 'px';
      clone.style.top = rect.top + 'px';
      clone.style.width = rect.width + 'px';
      clone.style.height = rect.height + 'px';
      clone.style.boxShadow = 'none';
      document.body.appendChild(clone);
      return clone;
    }

    function animateFlight(clone, fromRect, toRect, onComplete) {
      cancelCurrentFlight();

      var animation = clone.animate([
        {
          left: fromRect.left + 'px',
          top: fromRect.top + 'px',
          width: fromRect.width + 'px',
          height: fromRect.height + 'px',
          opacity: 1
        },
        {
          left: toRect.left + 'px',
          top: toRect.top + 'px',
          width: toRect.width + 'px',
          height: toRect.height + 'px',
          opacity: 1
        }
      ], {
        duration: 750,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      });

      currentFlightAnimation = animation;

      function finalize() {
        clone.remove();
        currentFlightAnimation = null;
        onComplete();
      }

      animation.addEventListener('finish', finalize);
      animation.addEventListener('cancel', finalize);
    }

    function isFigureRenderedAndVisible() {
      if (!mainFigure.isConnected || mainFigure.getClientRects().length === 0) {
        return false;
      }

      for (var node = mainFigure; node && node.nodeType === 1; node = node.parentElement) {
        var style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') {
          return false;
        }

        // Generic collapsed-container signal without class/attribute keywords:
        // content exists (scrollHeight > 0) but rendered box has zero height and clips overflow.
        if (
          node !== mainFigure &&
          node.clientHeight === 0 &&
          node.scrollHeight > 0 &&
          (style.overflow !== 'visible' || style.overflowY !== 'visible')
        ) {
          return false;
        }
      }

      return true;
    }

    function rememberSourceRect() {
      if (!sourceImage || window.innerWidth < 1200 || !isFigureRenderedAndVisible()) return;

      var rect = sourceImage.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0 && rect.height > 0) {
        lastSourceRect = rect;
      }
    }

    function updateStickyTopOffset() {
      var topOffset = headerHeight;
      var sidebar = document.querySelector('#pst-secondary-sidebar');

      if (window.innerWidth >= 1200 && sidebar && !sidebar.classList.contains('hide')) {
        // Reserve space only for the local TOC block (heading + nav item).
        var tocNav = sidebar.querySelector('nav.page-toc');
        var tocBox = tocNav ? (tocNav.closest('.sidebar-secondary-item') || tocNav) : null;

        if (tocBox) {
          var tocRect = tocBox.getBoundingClientRect();
          if (tocRect.height > 0 && tocRect.bottom > topOffset) {
            topOffset = Math.ceil(tocRect.bottom + 8);
          }
        }
      }

      // Keep at least some viewport space for the sticky figure.
      var maxTopOffset = Math.max(headerHeight, window.innerHeight - 140);
      if (topOffset > maxTopOffset) {
        topOffset = maxTopOffset;
      }

      aside.style.top = topOffset + 'px';
      aside.style.maxHeight = 'calc(100vh - ' + topOffset + 'px)';
    }

    function evaluateStickyVisibility() {
      rememberSourceRect();
      updateStickyTopOffset();

      var rect = mainFigure.getBoundingClientRect();
      if (window.innerWidth >= 1200 && isFigureRenderedAndVisible() && rect.bottom < headerHeight) {
        showStickyMargin();
      } else {
        hideStickyMargin();
      }
    }

    function showStickyMargin() {
      if (!isFigureRenderedAndVisible()) {
        hideStickyMargin();
        return;
      }

      updateStickyTopOffset();

      if (aside.classList.contains('is-visible')) {
        cancelPendingHide();
        typesetAsideMath();
        return;
      }

      cancelPendingHide();
      cancelCurrentFlight();
      aside.style.opacity = '1';

      if (
        prefersReducedMotion ||
        !allowFlightAnimation ||
        !sourceImage ||
        !targetImage ||
        !lastSourceRect ||
        window.innerWidth < 1200
      ) {
        ensureMathVisible();
        aside.classList.add('is-visible');
        typesetAsideMath();
        return;
      }

      aside.classList.add('is-preparing');
      var targetRect = targetImage.getBoundingClientRect();
      aside.classList.remove('is-preparing');

      if (targetRect.width === 0 || targetRect.height === 0) {
        ensureMathVisible();
        aside.classList.add('is-visible');
        typesetAsideMath();
        return;
      }

      var clone = createFlightClone(sourceImage, lastSourceRect);

      animateFlight(clone, lastSourceRect, targetRect, function () {
        ensureMathVisible();
        aside.classList.add('is-visible');
        typesetAsideMath();
      });
    }

    function hideStickyMargin() {
      if (!aside.classList.contains('is-visible')) {
        return;
      }

      cancelPendingHide();
      cancelCurrentFlight();

      if (prefersReducedMotion || !sourceImage || !targetImage || window.innerWidth < 1200) {
        aside.classList.remove('is-visible');
        aside.style.opacity = '1';
        return;
      }

      aside.style.opacity = '0';
      hideTimeoutId = setTimeout(function () {
        aside.classList.remove('is-visible');
        aside.style.opacity = '1';
        hideTimeoutId = null;
      }, 150);
    }

    window.addEventListener('scroll', function() {
      if (!allowFlightAnimation && Math.abs(window.scrollY - initialScrollY) > 2) {
        allowFlightAnimation = true;
      }
      rememberSourceRect();
      updateStickyTopOffset();
    }, { passive: true });
    window.addEventListener('resize', function () {
      rememberSourceRect();
      updateStickyTopOffset();
    });

    var headerEl = document.querySelector('.bd-header-article') || document.querySelector('header');
    var headerHeight = headerEl ? headerEl.offsetHeight : 0;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        rememberSourceRect();
        updateStickyTopOffset();

        if (window.innerWidth < 1200 || !isFigureRenderedAndVisible()) {
          hideStickyMargin();
          return;
        }

        if (entry.isIntersecting) {
          // Figure came back into view - hide margin
          hideStickyMargin();
        } else if (entry.boundingClientRect.bottom < headerHeight) {
          // Figure scrolled above header - show margin
          showStickyMargin();
        }
      });
    }, { threshold: 0, rootMargin: '-' + headerHeight + 'px 0px 0px 0px' });

    observer.observe(mainFigure);

    window.addEventListener('load', function () {
      evaluateStickyVisibility();

      if (aside.classList.contains('is-visible')) {
        typesetAsideMath();
      }
    });

    // Manually trigger visibility check on page load for current scroll position
    requestAnimationFrame(function() {
      evaluateStickyVisibility();
    });
  });
});
