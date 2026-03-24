````{margin}

```{note}

{bdg-primary}`Sphinx Extension`

```

```{seealso}

[{octicon}`mark-github` Repository](https://github.com/TeachBooks/Sphinx-Sticky-Margin)

```

````

::::{include} README.md
::::

## Examples

These examples show how to enable sticky margin behavior by adding the `sticky-margin` class to a figure.

### Example 1: Basic figure with sticky margin

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

### Example 2: Regular figure (no sticky margin)

````md
```{figure} /images/TeachBooks_logo.svg
:name: sticky_regular
:width: 50%

A normal figure without the sticky class.
```
````

```{figure} /images/TeachBooks_logo.svg
:name: sticky_regular
:width: 50%

A normal figure without the sticky class.
```

### Example 3: Multiple sticky figures

````md
```{figure} /images/TeachBooks_logo.svg
:name: sticky_multi_1
:class: sticky-margin
:width: 45%

First sticky figure.
```

```{figure} /images/TeachBooks_logo.svg
:name: sticky_multi_2
:class: sticky-margin
:width: 45%

Second sticky figure.
```
````

```{figure} /images/TeachBooks_logo.svg
:name: sticky_multi_1
:class: sticky-margin
:width: 45%

First sticky figure.
```

```{figure} /images/TeachBooks_logo.svg
:name: sticky_multi_2
:class: sticky-margin
:width: 45%

Second sticky figure.
```

### Example 4: Behavior on small screens

On viewport widths below 1200px, sticky margin clones are not shown and figures behave normally in the main content flow.

::::{include} README.md
:start-after: "## Notes"
::::