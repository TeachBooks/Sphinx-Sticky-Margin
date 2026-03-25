# Sphinx Sticky Margin

`sphinx-sticky-margin` is a Sphinx extension that adds a sticky margin copy for figures marked with the `:sticky-margin:` option.

When the original figure scrolls above the header, a duplicate appears in the right margin (on wide screens). When the original figure comes back into view, the margin copy is hidden. This only works for one figure with the `:sticky-margin:` option per page.

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

Add the `:sticky-margin:` option to figures that should get a sticky margin clone.

### MyST Example

````md
```{figure} path/to/image.png
:sticky-margin:

Figure caption.
```
````

### reStructuredText Example

```rst
.. figure:: path/to/image.png
   :sticky-margin:

   Figure caption.
```

## Notes

- The sticky margin display is active from `1200px` viewport width and up.
- The extension injects `sticky-margin.css` and `sticky-margin.js`.
- MathJax content inside sticky figures is re-typeset when needed.
