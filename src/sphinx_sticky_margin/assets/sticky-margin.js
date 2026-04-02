document.addEventListener('DOMContentLoaded', function () {
  var handledFigures = new WeakSet();
  var stickySidebarEntries = [];
  var stickyVisibilityEvaluators = [];
  var layoutObserversInitialized = false;
  var layoutRecheckFrameId = null;
  var hideMarkers = Array.prototype.slice.call(
    document.querySelectorAll('.hide-sticky-margin-marker')
  );
  var stickyTriggerMode = (
    typeof stickyMarginTrigger === 'string' ? stickyMarginTrigger.toLowerCase() : 'full'
  );
  if (stickyTriggerMode !== 'partial' && stickyTriggerMode !== 'full') {
    stickyTriggerMode = 'full';
  }

  function compareFigureDocumentOrder(a, b) {
    if (a === b) {
      return 0;
    }

    var position = a.compareDocumentPosition(b);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    }
    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }

    return 0;
  }

  function getFigureSortMetrics(figure) {
    var rect = figure.getBoundingClientRect();
    var scrollX = window.scrollX || window.pageXOffset || 0;
    var scrollY = window.scrollY || window.pageYOffset || 0;

    return {
      // Sticky activation uses figure bottom crossing the header, so bottom Y is
      // the most natural ordering key for rendered behavior.
      bottom: rect.bottom + scrollY,
      top: rect.top + scrollY,
      left: rect.left + scrollX,
      height: rect.height,
      width: rect.width
    };
  }

  function reorderStickySidebarItems() {
    if (!stickySidebarEntries.length) {
      return;
    }

    var sortedEntries = stickySidebarEntries.slice().sort(function (a, b) {
      var aMetrics = getFigureSortMetrics(a.mainFigure);
      var bMetrics = getFigureSortMetrics(b.mainFigure);

      if (aMetrics.bottom !== bMetrics.bottom) {
        return aMetrics.bottom - bMetrics.bottom;
      }
      if (aMetrics.top !== bMetrics.top) {
        return aMetrics.top - bMetrics.top;
      }
      if (aMetrics.left !== bMetrics.left) {
        return aMetrics.left - bMetrics.left;
      }
      if (aMetrics.height !== bMetrics.height) {
        return aMetrics.height - bMetrics.height;
      }
      if (aMetrics.width !== bMetrics.width) {
        return aMetrics.width - bMetrics.width;
      }

      return compareFigureDocumentOrder(a.mainFigure, b.mainFigure);
    });

    sortedEntries.forEach(function (entry) {
      if (entry.stickyItem && entry.stickyItem.parentElement) {
        entry.stickyItem.parentElement.appendChild(entry.stickyItem);
      }
    });
  }

  function scheduleGlobalLayoutRecheck() {
    if (layoutRecheckFrameId !== null) {
      return;
    }

    layoutRecheckFrameId = requestAnimationFrame(function () {
      layoutRecheckFrameId = null;
      reorderStickySidebarItems();

      stickyVisibilityEvaluators.forEach(function (evaluate) {
        evaluate();
      });
    });
  }

  function setupLayoutObserversOnce() {
    if (layoutObserversInitialized) {
      return;
    }

    layoutObserversInitialized = true;

    window.addEventListener('resize', function () {
      scheduleGlobalLayoutRecheck();
    });

    if (window.ResizeObserver) {
      var layoutResizeObserver = new ResizeObserver(function () {
        scheduleGlobalLayoutRecheck();
      });

      var resizeTargets = [
        document.querySelector('.bd-header-article') || document.querySelector('header'),
        document.querySelector('#pst-primary-sidebar'),
        document.querySelector('#pst-secondary-sidebar'),
        document.querySelector('.bd-main')
      ];

      resizeTargets.forEach(function (target) {
        if (target) {
          layoutResizeObserver.observe(target);
        }
      });
    }

    if (window.MutationObserver) {
      var layoutMutationObserver = new MutationObserver(function () {
        scheduleGlobalLayoutRecheck();
      });

      [
        document.documentElement,
        document.body,
        document.querySelector('.bd-header-article') || document.querySelector('header'),
        document.querySelector('#pst-primary-sidebar'),
        document.querySelector('#pst-secondary-sidebar')
      ].forEach(function (target) {
        if (!target) {
          return;
        }

        layoutMutationObserver.observe(target, {
          attributes: true,
          attributeFilter: ['class', 'style', 'hidden', 'aria-expanded', 'aria-hidden']
        });
      });
    }
  }

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

  function normalizeSidebarTextSpacing(root) {
    if (!root) {
      return;
    }

    root.querySelectorAll('br').forEach(function (lineBreak) {
      lineBreak.replaceWith(document.createTextNode(' '));
    });
  }

  document.querySelectorAll('.sticky-margin').forEach(function (marker) {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (marker.classList && marker.classList.contains('dropdown')) {
      marker.classList.remove('sticky-margin');
      console.log('Warning: Element with both "sticky-margin" and "dropdown" classes found. "sticky-margin" class has been removed to avoid conflicts between behaviors.', marker);
      return;
    }

    var mainFigure = marker;
    if (marker.tagName === 'FIGURE') {
      mainFigure = marker;
    } else if (marker.tagName === 'DIV') {
      // Allow standalone or nested div.sticky-margin blocks to be sticky on their own.
      mainFigure = marker;
    } else {
      mainFigure = marker.closest('figure') || marker;
    }

    if (!mainFigure || handledFigures.has(mainFigure)) return;
    handledFigures.add(mainFigure);

    var aside = document.createElement('aside');
    aside.className = 'sticky-margin sticky-margin-generated';

    var figureClone = mainFigure.cloneNode(true);
    normalizeSidebarTextSpacing(figureClone);
    aside.appendChild(figureClone);

    // Prefer mounting in the same sidebar column as the local TOC.
    // If the page has no local TOC/sidebar, create the normal secondary
    // sidebar container and mount the sticky figure there.
    var sidebar = document.querySelector('#pst-secondary-sidebar');
    if (!sidebar) {
      sidebar = document.createElement('div');
      sidebar.id = 'pst-secondary-sidebar';
      sidebar.className = 'bd-sidebar-secondary bd-toc';
      sidebar.classList.add('sticky-margin-generated-sidebar');

      var sidebarItems = document.createElement('div');
      sidebarItems.className = 'sidebar-secondary-items sidebar-secondary__inner';
      sidebar.appendChild(sidebarItems);

      if (!insertGeneratedSidebar(sidebar)) {
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

        if (sidebar.classList.contains('sticky-margin-generated-sidebar')) {
          var generatedTitleSpacer = document.createElement('div');
          generatedTitleSpacer.className = 'sticky-margin-generated-title-spacer';
          stickyList.appendChild(generatedTitleSpacer);
        }

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

      stickySidebarEntries.push({
        mainFigure: mainFigure,
        stickyItem: stickyItem
      });
      reorderStickySidebarItems();

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

    var sourceFlightElement = mainFigure;
    var targetFlightElement = aside.querySelector('figure') || aside.firstElementChild;
    var hideMarker = getNextHideMarker(mainFigure);
    var lastSourceRect = null;
    var currentFlightAnimation = null;
    var currentFlightClone = null;
    var hideTimeoutId = null;
    var visibilityToken = 0;
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

      if (currentFlightClone) {
        currentFlightClone.remove();
        currentFlightClone = null;
      }
    }

    function invalidateVisibilityToken() {
      visibilityToken += 1;
      return visibilityToken;
    }

    function createFlightClone(element, rect) {
      var clone = element.cloneNode(true);
      clone.className = element.className;
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
      currentFlightClone = clone;

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

      function cleanup() {
        clone.remove();
        currentFlightAnimation = null;
        if (currentFlightClone === clone) {
          currentFlightClone = null;
        }
      }

      function handleFinish() {
        cleanup();
        onComplete();
      }

      function handleCancel() {
        cleanup();
      }

      animation.addEventListener('finish', handleFinish, { once: true });
      animation.addEventListener('cancel', handleCancel, { once: true });
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
      if (!sourceFlightElement || window.innerWidth < 1200 || !isFigureRenderedAndVisible()) return;

      var rect = sourceFlightElement.getBoundingClientRect();
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

    function hasHideMarkerPassedHeader() {
      return !!(hideMarker && hideMarker.getBoundingClientRect().top < headerHeight);
    }

    function shouldShowStickyNow() {
      if (window.innerWidth < 1200 || !isFigureRenderedAndVisible()) {
        return false;
      }

      var rect = mainFigure.getBoundingClientRect();
      var isAboveHeaderThreshold = stickyTriggerMode === 'partial'
        ? rect.top < headerHeight
        : rect.bottom < headerHeight;
      if (!isAboveHeaderThreshold) {
        return false;
      }

      if (hasHideMarkerPassedHeader()) {
        return false;
      }

      return true;
    }

    function evaluateStickyVisibility() {
      rememberSourceRect();
      updateStickyTopOffset();

      var markerPassedHeader = hasHideMarkerPassedHeader();
      var crossedHideMarkerUpward = hideMarker && previousMarkerPassedHeader && !markerPassedHeader && isScrollingUp;
      if (shouldShowStickyNow()) {
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

      // Avoid re-entrant transitions while a flight animation is preparing.
      if (aside.classList.contains('is-preparing')) {
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
      var showToken = invalidateVisibilityToken();

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
        !sourceFlightElement ||
        !targetFlightElement ||
        !lastSourceRect ||
        window.innerWidth < 1200
      ) {
        ensureMathVisible();
        aside.classList.add('is-visible');
        typesetAsideMath();
        return;
      }

        aside.classList.add('is-preparing');
        var targetRect = targetFlightElement.getBoundingClientRect();

      if (targetRect.width === 0 || targetRect.height === 0) {
        aside.classList.remove('is-preparing');
        ensureMathVisible();
        aside.classList.add('is-visible');
        typesetAsideMath();
        return;
      }

      var clone = createFlightClone(sourceFlightElement, lastSourceRect);

      animateFlight(clone, lastSourceRect, targetRect, function () {
        if (showToken !== visibilityToken) {
          return;
        }

        if (!shouldShowStickyNow()) {
          return;
        }

        aside.classList.remove('is-preparing');
        ensureMathVisible();
        aside.classList.add('is-visible');
        typesetAsideMath();
      });
    }

    function hideStickyMargin() {
      if (!aside.classList.contains('is-visible') && !aside.classList.contains('is-preparing')) {
        return;
      }

      invalidateVisibilityToken();

      cancelPendingHide();
      cancelCurrentFlight();
      if (aside.classList.contains('is-preparing')) {
        aside.classList.remove('is-preparing');
        aside.classList.remove('is-visible');
        aside.style.opacity = '1';
        return;
      }

      if (prefersReducedMotion || !sourceFlightElement || !targetFlightElement || window.innerWidth < 1200) {
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

      var shouldEvaluateOnScroll = stickyTriggerMode === 'partial' ||
        aside.classList.contains('is-preparing') ||
        aside.classList.contains('is-visible');
      if (shouldEvaluateOnScroll) {
        evaluateStickyVisibility();
      }
    }, { passive: true });

    stickyVisibilityEvaluators.push(function () {
      evaluateStickyVisibility();
    });
    setupLayoutObserversOnce();

    if (window.ResizeObserver) {
      var figureResizeObserver = new ResizeObserver(function () {
        reorderStickySidebarItems();
      });
      figureResizeObserver.observe(mainFigure);
    }

    var headerEl = document.querySelector('.bd-header-article') || document.querySelector('header');
    var headerHeight = headerEl ? headerEl.offsetHeight : 0;
    previousMarkerPassedHeader = hideMarker ? hideMarker.getBoundingClientRect().top < headerHeight : false;

    var observer = new IntersectionObserver(function (entries) {
      if (!entries.length) {
        return;
      }

      evaluateStickyVisibility();
    }, { threshold: 0, rootMargin: '-' + headerHeight + 'px 0px 0px 0px' });

    observer.observe(mainFigure);

    if (hideMarker) {
      var hideObserver = new IntersectionObserver(function () {
        evaluateStickyVisibility();
      }, { threshold: 0, rootMargin: '-' + headerHeight + 'px 0px 0px 0px' });

      hideObserver.observe(hideMarker);
    }

    window.addEventListener('load', function () {
      reorderStickySidebarItems();
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
