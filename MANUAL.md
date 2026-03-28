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

Use a hide marker to stop showing all sticky figures after a specific point defined before that point:

````md
```{hide-sticky-margin}
```
````

When the hide marker scrolls out of view at the top when scrolling down, all sticky figures defined before that marker will be hidden.

When scrolling back up, the sticky margin figures above a hide marker (but after any previous hide marker) will reappear when that hide marker scrolls back below the header.

::::{include} README.md
:start-after: "## Installation"
::::

## Additional content

The next content is only added to insert a `hide-sticky-margin` directive to insert a marker, and to show case the scrolling behavior of the sticky margin figures when the hide marker scrolls out of view.

First some filler code:

````python
def add(a, b):
    return a + b
```
````

Then the hide marker, which does not show up in the content but is used to hide the sticky margin figures when it scrolls out of view.

```{hide-sticky-margin}
```

Just above this line the hide marker was added, so when you scroll down and this text reaches the top of the page, all sticky margin figures defined before this line will be hidden. When you scroll back up and this line scrolls back below the header, the sticky margin figures above this line (but after any previous hide marker) will reappear.

Now some lorem ipsum to make sure the hide marker scrolls out of view:

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue. Nam tincidunt congue enim, ut porta lorem lacinia consectetur. Donec ut libero sed arcu vehicula ultricies a non tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut gravida lorem. Ut turpis felis, pulvinar a semper sed, adipiscing id dolor. Pellentesque auctor nisi id magna consequat sagittis. Curabitur dapibus enim sit amet elit pharetra tincidunt feugiat nisl imperdiet. Ut convallis libero in urna ultrices accumsan. Donec sed odio eros. Donec viverra mi quis quam pulvinar at malesuada arcu rhoncus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In rutrum accumsan ultricies. Mauris vitae nisi at sem facilisis semper ac in est. Vivamus fermentum semper porta. Nunc diam velit, adipiscing ut tristique vitae, sagittis vel odio. Maecenas convallis ullamcorper ultricies. Curabitur ornare, ligula semper consectetur sagittis, nisi diam iaculis velit, id fringilla sem nunc vel mi. Nam dictum, odio nec pretium volutpat, arcu ante placerat erat, non tristique elit urna et turpis. Quisque mi metus, ornare sit amet fermentum et, tincidunt et orci. Fusce eget orci a orci congue vestibulum. Ut dolor diam, elementum et vestibulum eu, porttitor vel elit. Curabitur venenatis pulvinar tellus gravida ornare. Sed sit amet est vitae risus luctus euismod.