# Sphinx Sticky Margin

`sphinx-sticky-margin` is a Sphinx extension that adds a sticky margin copy for images, figures and other elements marked using the class `sticky-margin`.

When the original element scrolls above the header, a duplicate appears in the right margin (on wide screens). When the original element comes back into view, the margin copy is hidden.

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

Add the option `:figclass: sticky-margin` to a `figure` directive that should get a sticky margin clone. (For backward compatibility, `:class: sticky-margin` also works for `figure` directives.)

Add the option `:class: sticky-margin` to a directive that generates an HTML `<div>` element that should get a sticky margin clone.

Add the option `:class: sticky-margin` to a `image` directive that should get a sticky margin clone.

Insert a `hide-sticky-margin` directive to insert a marker after which to fade out the last sticky elements during scrolling.

The sticky margin elements will appear when the original element scrolls out of view, and will disappear when the original element comes back into view.

In case of multiple sticky margin elements, all will be shown in the margin.

If a hide marker scrolls out of view at the top when scrolling down, all sticky elements defined before that marker will be hidden.

When scrolling back up, the sticky margin elements above a hide marker (but after any previous hide marker) will reappear when that hide marker scrolls back below the header.

### MyST Example

````md
```{figure} path/to/image.png
:figclass: sticky-margin

Figure caption.
```
````

### reStructuredText Example

```rst
.. figure:: path/to/image.png
   :figclass: sticky-margin

   Figure caption.
```

### Hide Marker (MyST)

````md
```{hide-sticky-margin}
```
````

### Images

````md
```{image} path/to/image.png
:class: sticky-margin
```
````

### Directives with `:class: sticky-margin`

````md
```{admonition} This is a sticky margin admonition
:class: sticky-margin

This content will appear in the sticky margin when the original element scrolls out of view.
```
````

When the marker scrolls above the header, the previous sticky margin elements are hidden with a fade-out.

## Notes

- The sticky margin display is active from `1200px` viewport width and up.
- The extension injects `sticky-margin.css` and `sticky-margin.js`.
- MathJax content inside sticky elements is re-typeset when needed.
- The extension removes explicit line endings (`<br>`, double space in markdown) from figure captions to prevent layout issues in the margin.
