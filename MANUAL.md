````{margin}

```{note}

{bdg-primary}`Sphinx Extension`

```

```{seealso}

[{octicon}`mark-github` Repository](https://github.com/TeachBooks/Sphinx-Sticky-Margin)

```
````

::::{include} README.md
:end-before: "**Installation**"
::::



**Example**

This example shows how to enable sticky margin behavior by adding the `:sticky-margin:` option to a figure.

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

::::{include} README.md
:start-after: "**Installation**"
::::