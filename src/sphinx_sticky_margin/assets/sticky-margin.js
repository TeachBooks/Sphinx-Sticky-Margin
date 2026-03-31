document.addEventListener('DOMContentLoaded', function () {
  var handledFigures = new WeakSet();
  var hideMarkers = Array.prototype.slice.call(
    document.querySelectorAll('.hide-sticky-margin-marker')
  );

  function getNextHideMarker(mainFigure) {
    for (var i = 0; i < hideMarkers.length; i += 1) {
      var marker = hideMarkers[i];
      if (mainFigure.compareDocumentPosition(marker) & Node.DOCUMENT_POSITION_FOLLOWING) {
        return marker;
      }
    }
    return null;
  }

  function getDocsMainContent() {
    var docsMain = document.querySelector('#main-content.bd-main, main.bd-main, .bd-main');
    if (!docsMain) {
      return null;
    }

    for (var i = 0; i < docsMain.children.length; i += 1) {
      var child = docsMain.children[i];
      if (child.classList && child.classList.contains('bd-content')) {
        return child;
      }
    }

    return docsMain.querySelector('.bd-content');
  }

  function insertGeneratedSidebar(sidebar) {
    var bdContent = getDocsMainContent();
    if (!bdContent) {
      return false;
    }

    var articleContainer = null;
    for (var i = 0; i < bdContent.children.length; i += 1) {
      var child = bdContent.children[i];
      if (child.classList && child.classList.contains('bd-article-container')) {
        articleContainer = child;
        break;
      }
    }

    if (articleContainer) {
      articleContainer.insertAdjacentElement('afterend', sidebar);
    } else {
      bdContent.appendChild(sidebar);
    }

    return true;
  }

  document.querySelectorAll('.sticky-margin').forEach(function (marker) {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var mainFigure = marker.tagName === 'FIGURE' ? marker : marker.closest('figure');

    if (!mainFigure || handledFigures.has(mainFigure)) return;
    handledFigures.add(mainFigure);

    var aside = document.createElement('aside');
    aside.className = 'sticky-margin sticky-margin-generated';
    aside.innerHTML = '<p class="sidebar-title"></p>';

    var figureClone = mainFigure.cloneNode(true);
    aside.appendChild(figureClone);

    // Prefer mounting in the same sidebar column as the local TOC.
    // If the page has no local TOC/sidebar, create the normal secondary
    // sidebar container and mount the sticky figure there.
    var sidebar = document.querySelector('#pst-secondary-sidebar');
    var sidebarWasGenerated = false;
    if (!sidebar) {
      sidebar = document.createElement('div');
      sidebar.id = 'pst-secondary-sidebar';
      sidebar.className = 'bd-sidebar-secondary bd-toc';
      sidebar.classList.add('sticky-margin-generated-sidebar');

      var sidebarItems = document.createElement('div');
      sidebarItems.className = 'sidebar-secondary-items sidebar-secondary__inner';
      sidebar.appendChild(sidebarItems);

      if (insertGeneratedSidebar(sidebar)) {
        sidebarWasGenerated = true;
      } else {
        sidebar = null;
      }
    }

    var sidebarInner = sidebar ? sidebar.querySelector('.sidebar-secondary-items, .sidebar-secondary__inner') : null;
    var tocItem = document.querySelector('#pst-secondary-sidebar .sidebar-secondary-item');
    if (sidebarInner) {
      var stickyList = sidebarInner.querySelector('.sticky-margin-secondary-list');
      if (!stickyList) {
        stickyList = document.createElement('div');
        stickyList.className = 'sticky-margin-secondary-list';

        if (tocItem && tocItem.parentElement === sidebarInner) {
          tocItem.insertAdjacentElement('afterend', stickyList);
        } else {
          sidebarInner.appendChild(stickyList);
        }
      }

      var stickyItem = document.createElement('div');
      stickyItem.className = 'sidebar-secondary-item sticky-margin-secondary-item';
      stickyItem.appendChild(aside);
      stickyList.appendChild(stickyItem);

      // For existing sidebars, remove title spacer so there is no extra whitespace.
      if (!sidebarWasGenerated) {
        var titleEl = aside.querySelector('.sidebar-title');
        if (titleEl) {
          titleEl.remove();
        }
      }
    } else {
      // Fallback for layouts without a secondary sidebar.
      var articleEl = document.querySelector('.bd-article') || document.body;
      var insertAfter = mainFigure;
      if (articleEl && articleEl !== document.body) {
        while (insertAfter.parentElement && insertAfter.parentElement !== articleEl) {
          insertAfter = insertAfter.parentElement;
        }
      }
      insertAfter.insertAdjacentElement('afterend', aside);
    }

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
    var hideMarker = getNextHideMarker(mainFigure);
    var lastSourceRect = null;
    var currentFlightAnimation = null;
    var hideTimeoutId = null;
    var allowFlightAnimation = false;
    var initialScrollY = window.scrollY;
    var lastScrollY = window.scrollY;
    var isScrollingUp = false;
    var previousMarkerPassedHeader = false;

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
      if (aside.closest('#pst-secondary-sidebar')) {
        aside.style.top = '0px';
        aside.style.maxHeight = 'calc(100vh - var(--pst-header-height, 4rem))';
        return;
      }

      var topOffset = headerHeight;
      var sidebar = document.querySelector('#pst-secondary-sidebar');

      if (window.innerWidth >= 1200 && sidebar && !sidebar.classList.contains('hide')) {
        // The sidebar itself owns open/collapsed behavior in CSS.
        var sidebarRect = sidebar.getBoundingClientRect();
        if (sidebarRect.height > 0 && sidebarRect.bottom > topOffset) {
          topOffset = Math.ceil(sidebarRect.bottom + 8);
        }
      }

      aside.style.top = topOffset + 'px';
      aside.style.maxHeight = 'calc(100vh - ' + topOffset + 'px)';
    }

    function evaluateStickyVisibility() {
      rememberSourceRect();
      updateStickyTopOffset();

      var rect = mainFigure.getBoundingClientRect();
      var markerPassedHeader = hideMarker && hideMarker.getBoundingClientRect().top < headerHeight;
      var crossedHideMarkerUpward = hideMarker && previousMarkerPassedHeader && !markerPassedHeader && isScrollingUp;
      if (
        window.innerWidth >= 1200 &&
        isFigureRenderedAndVisible() &&
        rect.bottom < headerHeight &&
        !markerPassedHeader
      ) {
        showStickyMargin(crossedHideMarkerUpward);
      } else {
        hideStickyMargin();
      }

      previousMarkerPassedHeader = !!markerPassedHeader;
    }

    function showStickyMargin(useFadeIn) {
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

      if (useFadeIn) {
        ensureMathVisible();
        aside.classList.add('is-visible');
        if (!prefersReducedMotion) {
          aside.style.opacity = '0';
          requestAnimationFrame(function () {
            aside.style.opacity = '1';
          });
        }
        typesetAsideMath();
        return;
      }

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

      if (targetRect.width === 0 || targetRect.height === 0) {
        aside.classList.remove('is-preparing');
        ensureMathVisible();
        aside.classList.add('is-visible');
        typesetAsideMath();
        return;
      }

      var clone = createFlightClone(sourceImage, lastSourceRect);

      animateFlight(clone, lastSourceRect, targetRect, function () {
        aside.classList.remove('is-preparing');
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
      var currentScrollY = window.scrollY;
      isScrollingUp = currentScrollY < lastScrollY;
      lastScrollY = currentScrollY;

      if (!allowFlightAnimation && Math.abs(window.scrollY - initialScrollY) > 2) {
        allowFlightAnimation = true;
      }
      rememberSourceRect();
      updateStickyTopOffset();
    }, { passive: true });
    window.addEventListener('resize', function () {
      rememberSourceRect();
      updateStickyTopOffset();
      evaluateStickyVisibility();
    });

    var headerEl = document.querySelector('.bd-header-article') || document.querySelector('header');
    var headerHeight = headerEl ? headerEl.offsetHeight : 0;
    previousMarkerPassedHeader = hideMarker ? hideMarker.getBoundingClientRect().top < headerHeight : false;

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
          showStickyMargin(false);
        }
      });
    }, { threshold: 0, rootMargin: '-' + headerHeight + 'px 0px 0px 0px' });

    observer.observe(mainFigure);

    if (hideMarker) {
      var hideObserver = new IntersectionObserver(function () {
        evaluateStickyVisibility();
      }, { threshold: 0, rootMargin: '-' + headerHeight + 'px 0px 0px 0px' });

      hideObserver.observe(hideMarker);
    }

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
