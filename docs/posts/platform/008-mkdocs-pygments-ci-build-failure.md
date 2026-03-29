---
date: 2026-03-29
title: "MkDocs CI Build Fails Locally It Works: The Pygments 2.19 NoneType Trap"
slug: mkdocs-ci-build-fails-pygments-nonetype-crash
authors:
  - ibtisam
categories:
  - Platform Engineering
tags:
  - MkDocs
  - MkDocs Material
  - Pygments
  - PyMdown Extensions
  - GitHub Actions
  - CI/CD
  - Debugging
  - Python
  - Documentation
excerpt_separator: <!-- more -->
---

# MkDocs CI Build Fails, Locally It Works: The Pygments 2.19 NoneType Trap

Everything was green for months. One new folder added, one push made — and CI started crashing with `AttributeError: 'NoneType' object has no attribute 'replace'`. Local builds: perfectly fine. GitHub Actions: dead.

This is the full root cause analysis and fix.

<!-- more -->

## The Error

```
ERROR - Error reading page 'cloud-infrastructure/aws/nat-gateway.md':
        'NoneType' object has no attribute 'replace'

Traceback (most recent call last):
  ...
  File ".../pymdownx/highlight.py", line 400, in highlight
    formatter = html_formatter(
  File ".../pymdownx/highlight.py", line 179, in __init__
    HtmlFormatter.__init__(self, **options)
  File ".../pygments/formatters/html.py", line 434, in __init__
    self.filename = html.escape(self._decodeifneeded(options.get('filename', '')))
AttributeError: 'NoneType' object has no attribute 'replace'
```

The crash was always on `nat-gateway.md` — but that file had nothing wrong with it. That was the first misleading signal.

## What I Tried First (And Was Wrong)

**Wrong theory #1 — bare fences.**
The error looked like a code block issue. I searched every file for unlabeled fences:

```bash
grep -rn '^```$' --include="*.md" .
```

Found some, fixed them all — build still failed.

**Wrong theory #2 — snippet references.**
`pymdownx.snippets` with `check_paths: true` can crash when a snippet file doesn't exist. I searched:

```bash
grep -rn "\-\-8<\-\-" cloud-infrastructure/aws/nat-gateway.md
grep -rn "\-\-8<\-\-" servers/nginx/
```

Nothing found. Not the issue.

**Wrong theory #3 — `pygments_lang_class: true`.**
I had this in `mkdocs.yml` and removed it. Build still failed.

**Wrong theory #4 — `fenced_code` conflicting with `pymdownx.superfences`.**
My `mkdocs.yml` didn't even have `fenced_code`. Wasted a cycle checking.

## The Actual Root Cause

After ruling out every content-level hypothesis, I checked what actually differs between local and CI environments:

```bash
# Local
pip show pygments | grep Version
# Version: 2.19.2  ← same version, but different OS

# CI
# Python 3.11.15 on ubuntu-latest, fresh install every run
```

The `requirements.txt` had this:

```text
pymdownx-extensions==10.16.1   # pinned ✅
mkdocs-material==9.7.1          # pinned ✅
pygments                        # NOT pinned ❌
```

CI installs `pygments` unpinned — it pulls the **latest version on every fresh run**. When `Pygments 2.19.x` was released, it introduced a breaking change in `HtmlFormatter.__init__`. The `options.get('filename', '')` call now returns `None` instead of an empty string when `filename` is explicitly passed as `None` by `pymdownx.highlight` during the `line_spans: __span` processing path.

The line in `mkdocs.yml` responsible:

```yaml
- pymdownx.highlight:
    use_pygments: true
    line_spans: __span     # ← this triggers the None filename path in Pygments 2.19
```

Local builds kept passing because my virtual environment was created before `Pygments 2.19` was released and was never upgraded. CI was always fresh — always latest — always broken.

## Why `nat-gateway.md` and Not Earlier Files?

The crash isn't file-specific. MkDocs processes files alphabetically within each folder. `nat-gateway.md` just happened to be the first file in the `aws/` folder that contained a specific code block pattern (a multi-line block triggering the affected formatter path) that exposed the bug. Earlier files processed fine by luck of their content.

## The Fix

Pin Pygments in `requirements.txt`:

```text
pygments==2.18.0
```

One line. Commit. Push. CI goes green.

```bash
echo "pygments==2.18.0" >> requirements.txt
git add requirements.txt
git commit -m "fix: pin pygments to 2.18.0 — 2.19.x breaks line_spans in pymdownx.highlight"
git push
```

## Why This Happens at All

The Python packaging ecosystem uses **semantic versioning** but doesn't always honour it. A `pip install pygments` in your CI installs whatever is latest at that moment. If a new release introduces a behavioral change — even a bug — every fresh CI run picks it up immediately.

Your local virtualenv, created once and rarely updated, is immune. This creates a **"works on my machine"** class of failures that are particularly hard to diagnose because there is no obvious diff between environments.

## The Correct Practice

After stabilising your docs build, freeze everything that matters:

```bash
pip freeze | grep -E "pygments|pymdown|mkdocs" >> requirements.txt
```

Or at minimum, pin any package that sits at a dependency boundary — packages that other pinned packages depend on but that you haven't explicitly pinned yourself.

| Package | Pinned in my `requirements.txt`? | Should be? |
|---|---|---|
| `mkdocs-material` | ✅ `==9.7.1` | Yes |
| `pymdownx-extensions` | ✅ `==10.16.1` | Yes |
| `pygments` | ❌ unpinned | **Yes — pin it** |
| `mkdocs` | ✅ `>=1.6.1,<2.0.0` | Acceptable range |

## Key Takeaway

> When CI fails but local builds pass, the first question is never *"what's wrong with my content?"* — it's *"what package version does CI install that my local env doesn't have?"*

The traceback led to `pygments/formatters/html.py`. Pygments was unpinned. That's all it was. Two hours of debugging, one line of fix.

## Repository

**[github.com/ibtisam-iq/nectar](https://github.com/ibtisam-iq/nectar)** — the docs project where this happened.
