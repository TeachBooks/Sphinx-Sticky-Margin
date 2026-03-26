# Sphinx Sticky Margin

`sphinx-sticky-margin` is a Sphinx extension that adds a sticky margin copy for figures marked with the `:class: sticky-margin` option.

When the original figure scrolls above the header, a duplicate appears in the right margin (on wide screens). When the original figure comes back into view, the margin copy is hidden. This only works for one figure with the `:class: sticky-margin` class per page.

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

Insert a `hide-sticky-margin` marker to fade out the previous sticky figure once you scroll past that marker.

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
