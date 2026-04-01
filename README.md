# Sphinx Sticky Margin

`sphinx-sticky-margin` is a Sphinx extension that adds a sticky margin copy for figures marked with the `:class: sticky-margin` option.

When the original figure scrolls above the header, a duplicate appears in the right margin (on wide screens). When the original figure comes back into view, the margin copy is hidden.

## Installation

```bash
pip install sphinx-sticky-margin
```

## Enable Extension

In `conf.py`:

```python
extensions = [
    "sphinx_sticky_margin",
]
```

For Jupyter Book (`_config.yml`):

```yaml
sphinx:
  extra_extensions:
    - sphinx_sticky_margin
```

## Usage

Add the `:class: sticky-margin` class to figures that should get a sticky margin clone.

Insert a `hide-sticky-margin` directive to insert a marker after which to fade out the last sticky figure during scrolling.

The sticky margin figure will appear when the original figure scrolls out of view, and will disappear when the original figure comes back into view.

In case of multiple sticky margin figures, all will be shown in the margin.

If a hide marker scrolls out of view at the top when scrolling down, all sticky figures defined before that marker will be hidden.

When scrolling back up, the sticky margin figures above a hide marker (but after any previous hide marker) will reappear when that hide marker scrolls back below the header.

### MyST Example

````md
```{figure} path/to/image.png
:class: sticky-margin

Figure caption.
```
````

### reStructuredText Example

```rst
.. figure:: path/to/image.png
   :class: sticky-margin

   Figure caption.
```

### Hide Marker (MyST)

````md
```{hide-sticky-margin}
```
````

When the marker scrolls above the header, the previous sticky margin figure is hidden with a fade-out.

## Notes

- The sticky margin display is active from `1200px` viewport width and up.
- The extension injects `sticky-margin.css` and `sticky-margin.js`.
- MathJax content inside sticky figures is re-typeset when needed.
- The extension removes explicit line endings (`<br>`, double space in markdown) from figure captions to prevent layout issues in the margin.
