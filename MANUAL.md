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

Now 10 paragraphs of lorem ipsum to make sure the hide marker scrolls out of view, generated with [Lorem Ipsum](https://www.lipsum.com/):

:::{admonition} Lorem ipsum
:class: tip

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis egestas, ipsum a blandit egestas, ex metus efficitur risus, non sagittis nisl tortor et lectus. Proin ac ullamcorper nisl. Aliquam egestas, nulla sed tempor blandit, urna nibh commodo enim, vel auctor nunc risus eget arcu. Sed blandit purus libero, eget consequat orci rutrum eu. Cras laoreet sem sed lorem facilisis, vel euismod elit ultrices. In vitae ligula at dui egestas ornare. Vivamus efficitur nisl nec blandit elementum. Curabitur commodo commodo vulputate. Sed pretium erat turpis, in euismod nunc mattis sed. In metus nunc, rutrum in tempor ut, elementum id tellus. Suspendisse vel sapien non ipsum rutrum blandit. Duis fringilla, metus nec viverra vehicula, erat velit facilisis sem, sed consectetur enim purus vel leo. Etiam ac placerat nisi. Aliquam tempus lectus sit amet sapien dictum, id aliquet ex tincidunt.

Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed blandit diam non felis egestas, eget tincidunt elit scelerisque. Aliquam blandit pellentesque nibh, vel tincidunt leo placerat ut. Sed scelerisque faucibus turpis, et aliquet eros ornare a. Maecenas nec efficitur sapien. Vivamus egestas cursus risus, sit amet tincidunt justo. Nulla quam massa, rhoncus ac sollicitudin quis, volutpat sed nisl. Suspendisse vel ipsum rhoncus, dictum enim at, fermentum diam. Nullam a ante ac purus tempus varius. Praesent rhoncus interdum libero, et fermentum purus venenatis vel. Sed tempus tincidunt nulla quis suscipit. Ut commodo dictum risus, ac maximus nisi volutpat malesuada. Etiam sed lacus consectetur, commodo sapien ut, dictum ante. Morbi placerat dui lectus, ac maximus nisl lacinia vitae. Aliquam eget aliquam libero.

Aliquam aliquam purus libero, ut accumsan ipsum hendrerit ac. Vivamus non magna accumsan, tempus massa quis, eleifend enim. Etiam scelerisque lectus ipsum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer elementum sem laoreet felis iaculis dignissim. Integer scelerisque ut ligula sed tincidunt. Donec nec gravida justo. Donec mollis, augue ut facilisis laoreet, turpis enim ullamcorper metus, a congue erat lectus et purus. Maecenas venenatis id nisi ut vestibulum. Vivamus dapibus blandit faucibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vivamus varius felis id velit bibendum, ut lacinia orci condimentum. Cras rhoncus finibus pretium.

Donec placerat odio mauris, in porttitor orci faucibus vitae. Suspendisse sed ipsum vel est efficitur dictum. Maecenas eget dui mi. Integer ultrices neque ipsum, at pharetra felis ultricies id. Ut efficitur, est id luctus varius, nibh mauris ultrices turpis, a ornare nibh lectus nec lorem. Sed venenatis dui in consequat volutpat. Ut mollis viverra tellus, id vehicula sapien efficitur vel. Proin bibendum, elit vitae facilisis porta, nisl ex sollicitudin metus, vel venenatis risus arcu id magna. Nullam eu condimentum libero, sit amet auctor urna.

Ut et malesuada est, non auctor quam. Vivamus tempus metus ante, ut porttitor magna tristique condimentum. Praesent eget erat at ipsum volutpat ultricies. Nullam vitae libero elit. In hac habitasse platea dictumst. Aenean molestie ex libero, sed egestas sem aliquet a. Aenean a orci et quam porttitor laoreet ac at lorem. Fusce facilisis turpis nunc, vel molestie tortor tempor nec. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum turpis dolor, efficitur in semper tristique, rhoncus ac lorem. Praesent rhoncus sollicitudin est, ac commodo eros iaculis in. Proin id mi pulvinar leo rutrum sagittis. Duis ornare, justo quis finibus vestibulum, ligula sapien ultrices mauris, et suscipit mi quam et enim. Duis blandit massa interdum risus sollicitudin, a interdum sem efficitur. Pellentesque hendrerit sem a justo tempus placerat. Duis finibus laoreet quam non aliquam.

Cras molestie, metus sed bibendum lacinia, arcu nisi suscipit risus, sit amet fringilla metus velit id ligula. Proin lectus justo, aliquet aliquet molestie vel, elementum semper nulla. Sed egestas nec lectus sit amet faucibus. Vivamus a lectus convallis arcu scelerisque faucibus. Sed vestibulum purus elit, sit amet consectetur quam lacinia ac. Aenean ut interdum ipsum, ac vehicula ex. In finibus, ex quis molestie bibendum, nunc elit molestie ipsum, in pharetra tortor massa at nulla. Nunc tincidunt ligula sed arcu sodales molestie. Phasellus sollicitudin pulvinar purus ac dapibus. Donec lacinia lacinia pulvinar. Curabitur dolor turpis, pretium sit amet libero ut, suscipit vehicula nunc. Pellentesque facilisis, urna vel lacinia tristique, quam ex tincidunt lectus, vitae luctus est felis vitae elit. Nulla facilisi.

Aliquam congue gravida lectus eu finibus. Pellentesque a accumsan libero, in vulputate lorem. Integer vel eros eu enim suscipit rhoncus. Pellentesque porta mauris augue, in faucibus odio consequat nec. Pellentesque nunc enim, maximus vitae porttitor eget, hendrerit in ex. Donec posuere velit sed elit sodales molestie. Etiam eleifend tortor vel quam condimentum condimentum. Sed cursus turpis quis semper tempus. Sed ac interdum mauris, efficitur aliquam odio. Proin consequat nec felis nec accumsan. Morbi vel elementum ante.

Fusce pulvinar suscipit laoreet. Etiam lacus urna, ornare rhoncus velit ultricies, ullamcorper pharetra felis. Etiam egestas venenatis bibendum. Vestibulum ultrices neque non consectetur sodales. Curabitur in posuere sem. Nam lobortis, mauris a interdum feugiat, tortor eros euismod mi, vel tempor velit nunc ut libero. Donec ullamcorper justo turpis, vel ornare sapien lobortis quis. Proin finibus tortor quis neque fermentum, sollicitudin eleifend purus dictum. Quisque libero dui, tristique non elementum ut, convallis in libero. Proin at lorem scelerisque, commodo est non, finibus tellus. Donec id felis ornare, vulputate lacus nec, pretium orci. Etiam elit nunc, luctus a sapien vel, luctus pellentesque ipsum. Proin in consectetur lacus.

Nunc velit arcu, ultrices sit amet fringilla vitae, sollicitudin eu lacus. Morbi neque tortor, vestibulum eget massa ac, ultrices egestas elit. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam vestibulum velit in leo viverra cursus. Praesent sit amet urna ante. Praesent rhoncus libero consequat purus vestibulum fringilla. Proin vehicula enim et congue tincidunt. Suspendisse ultricies augue a lectus interdum maximus. Nullam condimentum lacus ligula, sit amet maximus ex malesuada ut. Proin sit amet ultricies metus, quis rutrum lorem. Aliquam id nisl accumsan, convallis ante a, pulvinar lacus. Sed mollis, dui at imperdiet pulvinar, dui metus tempor ante, mattis ultricies dui metus eu turpis. Quisque gravida ullamcorper ante in fermentum. Pellentesque tincidunt turpis magna, sed eleifend ante accumsan eget. Vestibulum venenatis eget justo id euismod.

Duis orci ipsum, pretium ac vulputate a, viverra ut justo. Quisque libero est, lacinia nec ipsum vitae, posuere malesuada sem. Donec vel lorem eget enim rutrum egestas ut in augue. Suspendisse tincidunt, enim tempus interdum sagittis, orci metus iaculis metus, vitae porttitor ipsum lectus eget justo. Donec pellentesque non urna eget malesuada. In placerat dapibus velit, consectetur facilisis turpis aliquet vitae. Ut tempus consectetur pulvinar. Nulla a nisl sollicitudin, dictum urna eget, imperdiet leo. Donec vel finibus nunc. Vestibulum cursus neque vitae lorem suscipit, vitae eleifend felis suscipit. Donec rhoncus est non mi mattis, in hendrerit metus gravida. Vivamus in leo sagittis, ultricies odio eu, bibendum massa. Suspendisse sit amet vulputate dui. Nullam sit amet neque luctus, vestibulum nulla quis, imperdiet mi. Vivamus eget imperdiet erat. Maecenas congue eleifend fermentum.
:::