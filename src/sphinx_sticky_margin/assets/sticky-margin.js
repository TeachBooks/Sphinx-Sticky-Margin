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

      var visibleRect = mainFigure.getBoundingClientRect();
      for (var node = mainFigure; node && node.nodeType === 1; node = node.parentElement) {
        var style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') {
          return false;
        }

        if (style.overflow !== 'visible' || style.overflowX !== 'visible' || style.overflowY !== 'visible') {
          var clipRect = node.getBoundingClientRect();
          visibleRect = {
            left: Math.max(visibleRect.left, clipRect.left),
            top: Math.max(visibleRect.top, clipRect.top),
            right: Math.min(visibleRect.right, clipRect.right),
            bottom: Math.min(visibleRect.bottom, clipRect.bottom)
          };

          if (visibleRect.right <= visibleRect.left || visibleRect.bottom <= visibleRect.top) {
            return false;
          }
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

    function showStickyMargin() {
      if (!isFigureRenderedAndVisible()) {
        hideStickyMargin();
        return;
      }

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
      rememberSourceRect();
    }, { passive: true });
    window.addEventListener('resize', rememberSourceRect);

    var headerEl = document.querySelector('.bd-header-article') || document.querySelector('header');
    var headerHeight = headerEl ? headerEl.offsetHeight : 0;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        rememberSourceRect();

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
      if (aside.classList.contains('is-visible')) {
        typesetAsideMath();
      }
    });

    // Manually trigger visibility check on page load for current scroll position
    requestAnimationFrame(function() {
      rememberSourceRect();
      var rect = mainFigure.getBoundingClientRect();

      if (window.innerWidth >= 1200 && isFigureRenderedAndVisible() && rect.bottom < headerHeight) {
        showStickyMargin();
      } else {
        hideStickyMargin();
      }
    });
  });
});
