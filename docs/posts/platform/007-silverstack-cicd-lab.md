---
date: 2026-03-06
title: "My Self-Hosted CI/CD Lab: Jenkins, SonarQube, and Nexus on Custom Domains with SSL"
slug: self-hosted-cicd-lab-jenkins-sonarqube-nexus
authors:
  - ibtisam
categories:
  - Platform Engineering
tags:
  - Jenkins
  - SonarQube
  - Nexus
  - Docker
  - Cloudflare Tunnel
  - Self-Hosted
  - Platform Engineering
excerpt_separator: <!-- more -->
---

# My Self-Hosted CI/CD Lab: Jenkins, SonarQube, and Nexus on Custom Domains with SSL

A four-node CI/CD lab — each service on its own server, its own subdomain, its own SSL cert — reproduced from a single command. No public IP. No manual setup.

<!-- more -->

## What I Built

A self-hosted CI/CD stack running on four dedicated nodes connected over a private network:

| Node | Hostname | Role | Resources |
|---|---|---|---|
| 1 | `dev-machine` | Jump server / workstation | 1 CPU · 1 GiB |
| 2 | `jenkins-server` | Jenkins LTS | 3 CPU · 4 GiB |
| 3 | `sonarqube-server` | SonarQube 26.2 CE | 3 CPU · 6 GiB |
| 4 | `nexus-server` | Nexus 3.89.1 OSS | 3 CPU · 5 GiB |

Every node boots from a custom Docker rootfs image — fully configured, zero manual steps after boot.

## Architecture

```
Internet
    │
    ▼
Cloudflare Edge  (SSL termination)
    │
    ├──► jenkins-server    cloudflared → Nginx :80 → Jenkins :8080
    ├──► sonarqube-server  cloudflared → Nginx :80 → SonarQube :9000
    └──► nexus-server      cloudflared → Nginx :80 → Nexus :8081

Internal network: 172.16.0.0/24
dev-machine ──SSH──► all three servers
```

No machine has a public IP. Cloudflare Tunnel provides outbound-only connectivity — SSL is terminated at Cloudflare's edge, no cert needed on the servers.

## The Images

All images follow a two-layer pattern:

**Base: [`ubuntu-24-04-rootfs`](https://github.com/ibtisam-iq/silver-stack/tree/main/iximiuz/rootfs/ubuntu)**
Built from `ubuntu:24.04`, fully unminimized, with systemd as PID 1, SSH (key-based only), and a curated DevOps toolset: `arkade`, `jq`, `yq`, `fx`, `task`, `just`, `fzf`, `btop`, `cfssl`, `ripgrep`, `code-server`.

**Service images — each `FROM` the base:**

| Image | Source | Key components |
|---|---|---|
| [`jenkins-rootfs`](https://github.com/ibtisam-iq/silver-stack/tree/main/iximiuz/rootfs/jenkins) | Jenkins LTS · Java 21 · Nginx · cloudflared |
| [`sonarqube-rootfs`](https://github.com/ibtisam-iq/silver-stack/tree/main/iximiuz/rootfs/sonarqube) | SonarQube 26.2 · PostgreSQL 18 · Java 21 · Nginx · cloudflared |
| [`nexus-rootfs`](https://github.com/ibtisam-iq/silver-stack/tree/main/iximiuz/rootfs/nexus) | Nexus 3.89.1 · Java 21 · Nginx · cloudflared |
| [`dev-cicd-rootfs`](https://github.com/ibtisam-iq/silver-stack/tree/main/iximiuz/rootfs/dev/ci-cd) | Base only + welcome page + SSH aliases |

## Port Configuration

Every service port is a build argument. A `__SERVICE_PORT__` placeholder is substituted at build time across nginx.conf, the systemd service file, and the welcome page simultaneously via `sed`. No hardcoded ports anywhere. See the [Jenkins Dockerfile](https://github.com/ibtisam-iq/silver-stack/blob/main/iximiuz/rootfs/jenkins/Dockerfile) for the pattern.

## Runtime Initialization

Each image includes a `lab-init.service` — a systemd `oneshot` that runs before all other services on every boot. It handles SSH host key generation, runtime directory creation, and service-specific setup.

The SonarQube [`lab-init.sh`](https://github.com/ibtisam-iq/silver-stack/blob/main/iximiuz/rootfs/sonarqube/scripts/lab-init.sh) is the most involved — it starts the PostgreSQL cluster, waits for readiness, creates the `sonar` role and `sonarqube` database idempotently, and applies the kernel parameters Elasticsearch requires (`vm.max_map_count=524288`, `fs.file-max=131072`).

## Build-Time Validation

Every image runs a [`healthcheck.sh`](https://github.com/ibtisam-iq/silver-stack/blob/main/iximiuz/rootfs/sonarqube/scripts/healthcheck.sh) as the final build step. It validates system tools, Java, service binaries, port substitution, Nginx config, systemd service enablement, SSH config, and user setup. A single failure exits non-zero and fails the build — no broken image can be pushed to GHCR.

## The Playground Manifest

The full four-node stack is defined in [`ci-cd-stack.yml`](https://github.com/ibtisam-iq/silver-stack/blob/main/iximiuz/manifests/ci-cd-stack.yml) and started with:

```bash
labctl playground create --base flexbox ci-cd-stack \
  -f iximiuz/manifests/ci-cd-stack.yml
```

Within 90 seconds all four VMs are up, all services running, SSH working between nodes.

## Going Live

From `dev-machine`, SSH into each server and follow the Cloudflare Tunnel steps in the welcome page:

```bash
ssh jenkins-server      # sudo cloudflared service install <token>
ssh sonarqube-server    # sudo cloudflared service install <token>
ssh nexus-server        # sudo cloudflared service install <token>
```

Result:
```
https://jenkins.yourdomain.com    → Jenkins LTS
https://sonarqube.yourdomain.com  → SonarQube 26.2 CE
https://nexus.yourdomain.com      → Nexus 3.89.1 OSS
```

## CI/CD for the Images

Five GitHub Actions workflows build and push all images automatically on push to `main`. Each workflow builds for `linux/amd64` and `linux/arm64`. See [`.github/workflows/`](https://github.com/ibtisam-iq/silver-stack/tree/main/.github/workflows) for all workflow files.

## Repository

**[github.com/ibtisam-iq/silver-stack](https://github.com/ibtisam-iq/silver-stack)**

---
*Part of the series: Building a Self-Hosted CI/CD Stack from Scratch*
