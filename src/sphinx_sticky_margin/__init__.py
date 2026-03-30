"""Sphinx Sticky Margin extension.

Adds frontend assets that duplicate figures with ``:class: sticky-margin``
into the right margin while scrolling.
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

from docutils import nodes
from docutils.parsers.rst import Directive
from sphinx.application import Sphinx
from sphinx.util.fileutil import copy_asset


try:
    from ._version import version as __version__
except Exception:  # pragma: no cover - generated at build time
    __version__ = "0+unknown"


class HideStickyMarginDirective(Directive):
    """Insert a marker that hides the previous sticky margin figure when passed."""

    has_content = False

    def run(self) -> list[nodes.Node]:
        marker = nodes.container(classes=["hide-sticky-margin-marker"])
        marker["aria-hidden"] = "true"
        return [marker]


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
    app.add_css_file("sticky-margin.css")
    app.add_js_file("sticky-margin.js")
    app.add_directive("hide-sticky-margin", HideStickyMarginDirective)
    app.connect("build-finished", _copy_asset_files)

    return {
        "version": __version__,
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
