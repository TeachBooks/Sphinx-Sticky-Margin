````{margin}

```{note}

{bdg-primary}`Sphinx Extension`

```

```{seealso}

[{octicon}`mark-github` Repository](https://github.com/TeachBooks/Sphinx-Sticky-Margin)

```
````

# Sticky Margin Figures

::::{include} README.md
:start-after: "# Sphinx Sticky Margin"
:end-before: "## Installation"
::::

## Example

This example shows how to enable sticky margin behavior by adding the `class: sticky-margin` option to a figure.

````md
```{figure} /images/TeachBooks_logo.svg
:name: sticky_basic
:class: sticky-margin
:width: 50%

A figure that moves to the margin after it scrolls out of view.
```
````

```{figure} /images/TeachBooks_logo.svg
:name: sticky_basic
:class: sticky-margin
:width: 50%

A figure that moves to the margin after it scrolls out of view.
```

Use a hide marker to stop showing that sticky figure after a specific point:

````md
```{hide-sticky-margin}
```
````

::::{include} README.md
:start-after: "## Installation"
::::