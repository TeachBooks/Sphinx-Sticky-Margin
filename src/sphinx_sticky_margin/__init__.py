"""Sphinx Sticky Margin extension.

Adds frontend assets that duplicate figures with the ``:sticky-margin:``
option into the right margin while scrolling.
"""

from __future__ import annotations

from importlib import import_module
from pathlib import Path
from typing import Optional

from docutils.parsers.rst import directives
from sphinx.application import Sphinx
from sphinx.util.fileutil import copy_asset


def _create_sticky_margin_figure_class(base_figure_class: type):
    """Wrap an existing figure directive class with ``:sticky-margin:`` support."""

    if getattr(base_figure_class, "_sticky_margin_wrapped", False):
        return base_figure_class

    base_option_spec = getattr(base_figure_class, "option_spec", {})
    if hasattr(base_option_spec, "copy"):
        option_spec = base_option_spec.copy()
    else:
        option_spec = dict(base_option_spec)
    option_spec.update({"sticky-margin": directives.flag})

    class StickyMarginFigure(base_figure_class):
        def run(self):
            result = super().run()
            if "sticky-margin" in self.options:
                for node in result:
                    if hasattr(node, "attributes") and "classes" in node.attributes:
                        if "sticky-margin" not in node["classes"]:
                            node["classes"].append("sticky-margin")
            return result

    StickyMarginFigure.option_spec = option_spec

    StickyMarginFigure.__name__ = f"{base_figure_class.__name__}StickyMargin"
    StickyMarginFigure._sticky_margin_wrapped = True
    return StickyMarginFigure


def _patch_figure_directive(app: Sphinx, *args, **kwargs) -> None:
    """Patch the currently registered figure directive to accept :sticky-margin:."""

    directives_map = getattr(app.registry, "directives", {})
    base_figure_class = directives_map.get("figure")
    if base_figure_class is None:
        return

    wrapped_figure_class = _create_sticky_margin_figure_class(base_figure_class)
    app.add_directive("figure", wrapped_figure_class, override=True)


try:
    __version__ = getattr(import_module("sphinx_sticky_margin._version"), "version")
except Exception:  # pragma: no cover - generated at build time
    __version__ = "0+unknown"


def _copy_asset_files(app: Sphinx, exception: Optional[Exception]) -> None:
    """Copy static assets into the builder's _static directory."""
    if exception is not None:
        return

    if app.builder.format != "html":
        return

    asset_dir = Path(__file__).parent / "assets"
    out_static_dir = Path(app.outdir) / "_static"
    out_static_dir.mkdir(parents=True, exist_ok=True)

    copy_asset(str(asset_dir / "sticky-margin.css"), str(out_static_dir))
    copy_asset(str(asset_dir / "sticky-margin.js"), str(out_static_dir))


def setup(app: Sphinx) -> dict[str, object]:
    """Register the extension with Sphinx."""
    app.connect("env-before-read-docs", _patch_figure_directive)
    app.add_css_file("sticky-margin.css")
    app.add_js_file("sticky-margin.js")
    app.connect("build-finished", _copy_asset_files)

    return {
        "version": __version__,
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
