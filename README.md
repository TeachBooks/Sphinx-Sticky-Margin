# Sphinx Sticky Margin

`sphinx-sticky-margin` is a Sphinx extension that adds a sticky margin copy for images, figures and other elements marked using the class `sticky-margin`.

When the original element scrolls above the header, a duplicate appears in the right margin (on wide screens). When the original element comes back into view, the margin copy is hidden.

<!-- Install start -->
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

### Enabling Sticky Margin Behavior

Add the option `:figclass: sticky-margin` to a `figure` directive that should get a sticky margin clone. (For backward compatibility, `:class: sticky-margin` also works for `figure` directives.)

Add the option `:class: sticky-margin` to a directive that generates an HTML `<div>` element that should get a sticky margin clone.

Add the option `:class: sticky-margin` to a `image` directive that should get a sticky margin clone.

The sticky margin elements will appear when the original element scrolls out of view, and will disappear when the original element comes back into view.

In case of multiple (active) sticky margin elements, all will be shown in the margin.

### Disabling Sticky Margin Behavior

Insert a `hide-sticky-margin` directive to insert a marker after which to fade out the last sticky elements during scrolling.

If a hide marker scrolls out of view at the top when scrolling down, all sticky elements defined before that marker will be hidden.

When scrolling back up, the sticky margin elements above a hide marker (but after any previous hide marker) will reappear when that hide marker scrolls back below the header.

### Sticky Margin Behavior

By _default_ the sticky margin element will appear when the original element is fully scrolled out of view, and will disappear when the original element is partially back in view.

In `partial` mode, the sticky margin element will appear when the original element is partially scrolled out of view, and will disappear when the original element is fully back in view.

To set the sticky margin trigger mode, add the following to `conf.py`:

```python
sticky_margin["trigger"] = "partial"  # or "full"
```

Or for Jupyter Book (`_config.yml`):

```yaml
sphinx:
  config:
    sticky_margin:
      trigger: partial  # or full
```

If any value other than `partial` or `full` is set, the extension will fall back to the default `full` mode with a warning.

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
