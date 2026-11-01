# Security

## Reporting a vulnerability

Report a vulnerability privately, through GitHub: the repository's **Security** tab, **Report a vulnerability**.
Please do not open a public issue for it. A report is answered within a week; a fix and an advisory follow, crediting
the reporter unless they ask not to be named.

## What galley guards

Templates are trusted code; the data they render is not ([README](README.md), "Untrusted input").

- `{ expr }` writes every value escaped, in element text and in attribute values in quotes;
- a value that begins a URL attribute must be relative or start with `http:`, `https:`, `mailto:` or `tel:`; anything
  else stops the render with `G5001`;
- data cannot make a template run code.

A way around any of these is a vulnerability.

Outside this boundary: anyone who can write a template; what `{@raw}` and `{@js}` write; a value in a place `{ }` does
not make safe, such as `<script>`, `<style>`, an `on*`, `style` or `srcdoc` attribute, or an attribute value without
quotes (README, "Known Limitations"). Confining `{@partial}` to a folder is the job of your include resolver.

## Supported versions

Fixes go into the latest release.
