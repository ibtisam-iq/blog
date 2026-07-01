---
date: 2026-07-02
title: "Project Card Authoring Standards"
slug: project-card-authoring-standards
authors:
  - ibtisam
categories:
  - Career & Growth
tags:
  - Career
  - DevOps
  - Documentation
excerpt_separator: <!-- more -->
---

# Project Card Authoring Standards

This document defines the exact rules for writing project cards in `data/projects.yaml` for [projects.ibtisam-iq.com](https://projects.ibtisam-iq.com). Every rule was extracted from real mistakes caught and corrected during the authoring sessions. If an LLM is reading this, follow every rule exactly.

The YAML file is the single source of truth. A push to `data/projects.yaml` triggers `node scripts/generate-projects.js`, which auto-generates `src/data/projects.ts`. The generated TypeScript file must never be edited directly.

<!-- more -->

If an LLM is reading this page, it must also adhere to the [AI Engineering Persona](https://blog.ibtisam-iq.com/my-core-ai-engineering-persona/) for all text content within the YAML.

---

## 1. YAML Schema

Every project card has the following fields:

```yaml
- slug: kebab-case-identifier
  title: "Full Descriptive Title with Key Technologies"
  category: platform | tool
  status: completed | maintained | in-progress | archived
  year: 2026
  shortDescription: "First sentence states what was built. Second sentence names key configurations."
  description: "Multi-paragraph text.\n\nParagraphs separated by double newlines."
  sections:
    - title: "Content-Driven Section Title"
      items:
        - "STAR-method sentence starting with an action verb."
  tags:
    - lowercase-kebab-case
  tech:
    - Properly Capitalized Tool Name
  links:
    - type: github
      url: "https://..."
  imageUrl: "/optional-image.png"
  featured: true
```

---

## 2. Field-by-Field Rules

### `slug`

A URL-safe kebab-case identifier. It appears in the route `/project/{slug}`.

- **Rule:** Use a descriptive, human-readable slug that identifies the project.
- **Why:** The slug is the permanent URL. Changing it breaks bookmarks and shared links.

| Wrong | Correct |
|---|---|
| `ms-demo` | `microservices-demo` |
| `project-1` | `java-monolith` |
| `silverStack` | `silverstack-cicd-platform` |

### `title`

The full project title displayed on the card and the detail page. The UI renders it in full with no truncation.

- **Rule:** Include the project name (if it has one), the primary action or architecture, and the key technologies. Separate concerns with commas, "with", or "and". Never use em dashes.
- **Why:** Recruiters scan titles first. A title that names specific tools gets matched by ATS keyword scanners. Em dashes are banned across all content (see the [AI Engineering Persona](https://blog.ibtisam-iq.com/my-core-ai-engineering-persona/)).

| Wrong | Correct |
|---|---|
| `"Microservices on EKS"` | `"Microservices GitOps on Amazon EKS with Terraform, 3 CI Pipelines, ArgoCD Image Updater, ExternalDNS, Gateway API, and Observability"` |
| `"DevSecOps — CI/CD Pipeline"` | `"14-Stage DevSecOps Pipeline Mirrored Across Jenkins and GitHub Actions with 3-Pass Trivy, SonarQube, and GHCR/Docker Hub/Nexus Publishing"` |
| `"Kubernetes Debugging Tool"` | `"DebugBox: Multi-Arch Kubernetes Diagnostics Toolkit with 3 Size-Optimized Variants, Trivy Gating, Hadolint, and MkDocs"` |

### `category`

Either `platform` or `tool`. Used for sidebar filtering.

- **Rule:** Use `platform` for infrastructure deployments and multi-service systems. Use `tool` for standalone utilities, CLIs, or developer tools.
- **Why:** The sidebar groups projects by category. Misclassification hides projects from filtered views.

### `status`

One of: `completed`, `maintained`, `in-progress`, `archived`. Used for sidebar filtering.

### `year`

The 4-digit year the project was built or last significantly updated. Used for sidebar filtering.

### `shortDescription`

The card-level summary. This is the most scrutinized field because it appears on every project card and must hook a recruiter in under 3 seconds.

- **Rule 1: Exactly 2 sentences.** No more, no fewer.
- **Why:** The original descriptions were 4-6 sentences and overwhelmed the card layout, pushing tech badges below the fold on mobile. Two sentences force you to pick the most important details.

- **Rule 2:** The first sentence states what was built, with what tools, and where it runs. The second sentence names the key configurations and integrations.
- **Why:** A recruiter scanning cards reads the first sentence to decide relevance and the second to assess depth.

- **Rule 3:** Include specific numbers and tool names. Never write vague summaries.
- **Why:** "Deployed microservices on Kubernetes" tells a recruiter nothing. "Deployed 10 microservices on Amazon EKS with Terraform" tells them exactly what you did.

- **Rule 4:** Never claim "production", "production-grade", or "production-ready". These are lab and sandbox projects.
- **Why:** Claiming production experience for lab projects is dishonest and will be caught in technical interviews.

**Wrong (4 sentences, vague):**

```
"Built a CI/CD pipeline with multiple tools and deployed it to the cloud.
The pipeline includes security scanning and code quality checks. Images are
published to container registries. The project demonstrates DevSecOps practices."
```

**Correct (2 sentences, specific):**

```
"Built a 14-stage CI pipeline for three codebases and implemented it identically
on Jenkins and GitHub Actions. Integrated Trivy, SonarQube quality gates, and
triple-registry publishing with strict GitOps handoff."
```

**Wrong (production claim):**

```
"Deployed microservices in a production-grade Kubernetes environment."
```

**Correct:**

```
"Deployed 10 microservices on Amazon EKS with Terraform, 3 CI pipelines,
and fully automated GitOps delivery via ArgoCD Image Updater."
```

### `description`

The full project narrative displayed on the detail page.

- **Rule 1:** Separate paragraphs with `\n\n`. The renderer splits on double newlines and wraps each paragraph in a `<p>` tag. A single `\n` does nothing visible.
- **Why:** Without `\n\n`, the entire description renders as a single wall of text.

- **Rule 2:** Write an engineering narrative, not marketing copy. State what was built, what constraints you worked around, what trade-offs you made, and what you debugged.
- **Why:** This document targets hiring managers who read for technical depth. Marketing language gets dismissed.

- **Rule 3:** Use honest verbs: built, configured, deployed, automated, wrote, set up, provisioned, integrated, debugged. Never use banned AI vocabulary (see Section 4 below).

- **Rule 4:** Never use the word "production" for lab or sandbox deployments. Use "deployment", "environment", or "architecture" instead.

| Wrong | Correct |
|---|---|
| `"This project leverages cutting-edge tools to deliver a seamless CI/CD experience."` | `"Built a standardized 14-stage CI pipeline for three monolithic codebases and implemented it identically on both Jenkins and GitHub Actions to prove the pipeline design is tool-agnostic."` |

### `sections`

Flexible content blocks displayed on the project detail page. Each section has a `title` and an `items[]` array.

- **Rule 1:** Section titles are free-form and content-driven. Write the title that matches the actual content.
- **Why:** Rigid titles like "Key Achievements" or "Motivation" force content into wrong categories. "Bare-Metal Portability" or "Networking & Edge Routing" tell the reader exactly what the section covers.

- **Rule 2:** Each item is a complete sentence starting with a strong action verb, following the STAR method (Situation, Task, Action, Result).
- **Why:** Bullet points that start with nouns ("The pipeline...") read passively. Action verbs ("Built...", "Configured...", "Debugged...") show agency.

- **Rule 3:** The number of sections and the number of items per section are fully flexible. Use as many as the content requires.

| Wrong Section Title | Correct Section Title |
|---|---|
| `"Key Achievements"` | `"CI Pipeline & Security"` |
| `"Technical Details"` | `"OS Engineering & Modular Architecture"` |
| `"Motivation"` | `"Bare-Metal Portability"` |
| `"Overview"` | `"Kubernetes & Traffic Routing"` |

| Wrong Item | Correct Item |
|---|---|
| `"Security scanning in the pipeline."` | `"Integrated Trivy filesystem and container image scanning to block vulnerabilities before artifacts reach the registry."` |
| `"Used Kustomize for deployments."` | `"Wrote a Kustomize overlay structure where bare-metal and EKS deployments share over 80% of the same base manifests."` |

### `tags`

Capability domains visible on project cards and used for sidebar filtering.

- **Rule 1:** Always lowercase kebab-case.
- **Why:** Tags are rendered as filter buttons and used as URL-safe parameters. Mixed case or spaces break filtering.

- **Rule 2:** Use workflow order, not alphabetical. Lead with the primary capability the project demonstrates.
- **Why:** A GitOps project leads with `gitops`, not `ci-cd`. The first tag signals the project's primary identity.

- **Rule 3:** Tags represent recruiter-level abstractions. Use broad domains, not specific tools.
- **Why:** A recruiter filters by "kubernetes" or "ci-cd", not by "ArgoCD" or "Jenkins". Tool-level specificity belongs in `tech[]`.

| Wrong (alphabetical) | Correct (workflow order, primary first) |
|---|---|
| `[ci-cd, containerization, gitops, kubernetes]` | `[kubernetes, gitops, ci-cd, iac, networking, observability, containerization, security, autoscaling]` |
| `[ArgoCD, Terraform, Docker]` (tool names) | `[gitops, iac, containerization]` (capability domains) |

**Valid tag vocabulary:**

`automation`, `autoscaling`, `aws`, `ci-cd`, `cloud-native`, `containerization`, `devsecops`, `documentation`, `gitops`, `iac`, `kubernetes`, `linux`, `microservices`, `networking`, `observability`, `orchestration`, `security`

### `tech`

Specific tools and technologies used in the project. Displayed as badges on project cards and used for sidebar filtering.

- **Rule 1:** Use proper capitalization exactly as the vendor writes it.
- **Why:** "Amazon EKS" is the official name. "eks" looks wrong to someone who works with the tool daily.

**Capitalization reference table:**

| Wrong | Correct |
|---|---|
| `eks` | `Amazon EKS` |
| `ecs` | `Amazon ECS` |
| `ec2` | `AWS EC2` |
| `rds` | `Amazon RDS` |
| `s3` | `Amazon S3` |
| `kms` | `AWS KMS` |
| `iam` | `AWS IAM` |
| `cloudfront` | `Amazon CloudFront` |
| `route53` | `Route 53` |
| `acm` | `AWS Certificate Manager` |
| `cloudtrail` | `AWS CloudTrail` |
| `cloudwatch` | `CloudWatch` |
| `github-actions` | `GitHub Actions` |
| `dockerhub` | `Docker Hub` |
| `sonarqube` | `SonarQube` |
| `argocd` | `ArgoCD` |

- **Rule 2:** Use workflow order, following the project's actual pipeline.
- **Why:** ATS keyword scanners treat lists as bag-of-words (position is irrelevant for automated matching). But a hiring manager reading the tech list top-to-bottom follows the deployment narrative. Alphabetical order (`AlertManager, Amazon EKS, ArgoCD, Docker...`) tells no story.

- **Rule 3:** Include every tool mentioned in the description or sections. Cross-reference the description text against the tech array to catch omissions.
- **Why:** During the initial audit, 22 technologies were missing across 7 projects. If a tool appears in a section bullet ("Created self-managed worker nodes via CloudFormation"), it must appear in `tech[]`. Missing a tool means missing an ATS keyword match.

**Workflow order convention:**

```
infra provisioning    → Terraform, CloudFormation, eksctl
compute/cluster       → Amazon EKS, kubeadm, AWS EC2, Amazon ECS
build/package         → Docker, Helm, Maven, npm
deploy/orchestrate    → ArgoCD, Kustomize, Helmfile
networking            → Gateway API, Nginx, Route 53, ExternalDNS
CI/CD                 → GitHub Actions, Jenkins
security/scanning     → Trivy, SonarQube, Bandit, Hadolint
registries            → GHCR, Docker Hub, Nexus
databases/storage     → Amazon RDS, DynamoDB, PostgreSQL, Amazon S3
observability         → Prometheus, Grafana, Elasticsearch, CloudWatch
supporting tools      → Bash, Make, AWS CLI
```

| Wrong (alphabetical) | Correct (workflow order) |
|---|---|
| `[ArgoCD, Amazon EKS, Docker, GitHub Actions, Helm, Prometheus, Terraform, Trivy]` | `[Terraform, Amazon EKS, Docker, Helm, ArgoCD, GitHub Actions, Trivy, Prometheus]` |

### `links`

Array of `{type, url}` pairs. Displayed as clickable buttons on project cards and detail pages.

- **Rule:** Use the standard type vocabulary. Custom types are allowed for multi-repo projects.

**Standard link types:**

| Type | Use Case |
|---|---|
| `github` | Single-repo projects |
| `app-repo` | Application source code (when separate from CD) |
| `cd-repo` | Deployment manifests repository |
| `runbook` | Operational documentation on runbook.ibtisam-iq.com |
| `blog` | Related blog post |
| `website` | Project's live website |
| `playground` | Interactive environment (e.g., iximiuz Labs) |
| `docs` | Documentation site (e.g., MkDocs) |
| `terminal-sessions` | Recorded terminal output |
| `screenshots` | Visual evidence of the deployment |

Custom types for multi-repo projects (the `type` value becomes the button label):

`java-monolith-repo`, `python-monolith-repo`, `node-monolith-repo`

### `featured`

Boolean. When `true`, the project is pinned to the top of the listing.

### `imageUrl`

Optional. Path to a hero image for the project. Omit the field entirely if not available.

---

## 3. Named Rules from Specific Corrections

Every rule below corresponds to a specific mistake that was caught and corrected during the authoring sessions.

### Rule: NO-PRODUCTION-CLAIMS

**The mistake:** The terminal animation described projects as "integrated systems, live in production." The shortDescription for `microservices-demo` originally referenced a "production" environment.

**The correction:** Changed to "integrated systems, end-to-end pipelines." Removed all "production" language from every field.

**The rule:** Never use the words "production", "production-grade", or "production-ready" anywhere in the YAML when describing these projects. They are lab and sandbox projects built for learning and demonstration.

**Applies to:** `shortDescription`, `description`, `sections.items`, `title`

### Rule: TWO-SENTENCE-SHORT-DESCRIPTION

**The mistake:** shortDescriptions were 4-6 sentences. This overwhelmed the project cards and pushed tech badges below the fold on mobile viewports.

**The correction:** All 8 projects were compressed to exactly 2-sentence hooks while preserving specific numbers and tool names.

**The rule:** Every `shortDescription` must be exactly 2 sentences. The first sentence states what was built. The second states key configurations. No exceptions.

### Rule: TECH-COMPLETENESS-AUDIT

**The mistake:** 22 technologies were missing across 7 projects. Specific examples:

- `retail-store-sample-app` mentioned eksctl, CloudFormation, and kubeadm in its description but none appeared in `tech[]`
- `silverstack-cicd-platform` was missing PostgreSQL and Bash
- `microservices-demo` was missing AlertManager, Elasticsearch, Filebeat, and Kibana
- `java-monolith` was missing Java 21, Spring Boot 3.4, and Maven
- `polyglot-monolith-deployment` was missing React, MySQL, PostgreSQL, and Docker Compose
- `devsecops-pipeline-engineering` was missing pytest, Bandit, pip-audit, ESLint, and JaCoCo
- `debugbox` was missing Hadolint and MkDocs

**The correction:** Cross-referenced every description and section item against the tech array. Added all 22 missing entries.

**The rule:** After writing or editing a card, read every sentence in `description` and every item in `sections`. If a tool name appears in the text, it must appear in `tech[]`. Run this audit before committing.

### Rule: WORKFLOW-ORDER-NOT-ALPHABETICAL

**The mistake:** `tech[]` and `tags[]` arrays were in arbitrary or alphabetical order.

**The correction:** All arrays across all 8 projects were reordered to follow the project's pipeline: infra, compute, build, deploy, network, CI/CD, security, registries, databases, observability, tooling.

**The rule:** Never alphabetize `tech[]` or `tags[]`. Use workflow order. For `tags[]`, lead with the primary capability the project demonstrates. A GitOps project leads with `gitops`, not `ci-cd`.

**Why alphabetical is wrong:** ATS keyword scanners treat lists as bag-of-words (position is irrelevant for automated matching). But a hiring manager reading the tech list top-to-bottom follows the deployment narrative. Alphabetical order tells no story. Workflow order mirrors how you would walk someone through the project in an interview.

### Rule: PROPER-TECH-CAPITALIZATION

**The mistake:** Tech entries used inconsistent capitalization across projects.

**The rule:** Match the vendor's official capitalization exactly. See the capitalization reference table in the `tech` field reference above.

### Rule: CONTENT-DRIVEN-SECTION-TITLES

**The mistake:** Early drafts used rigid section titles like "Key Achievements" that forced unrelated content into the same bucket.

**The rule:** Write section titles that describe the actual content. If the title could apply to any project, it is too generic.

**Real examples from the site:**

- "OS Engineering & Modular Architecture" (silverstack)
- "Bare-Metal Portability" (retail-store-sample-app)
- "Networking & Edge Routing" (silverstack)
- "GitOps & Continuous Delivery" (microservices-demo)
- "Kubernetes Developer Experience" (debugbox)
- "Storage & Replication" (aws-secure-static-hosting)

### Rule: NO-EM-DASHES

**The rule:** Never use em dashes or en dashes anywhere in the YAML. Use parentheses, commas, "with", "and", or start a new sentence.

**Applies to:** `title`, `shortDescription`, `description`, `sections.items`

| Wrong | Correct |
|---|---|
| `"Built a platform — Jenkins and Nexus — on microVMs"` | `"Built a platform (Jenkins and Nexus) on microVMs"` |
| `"CI/CD Pipeline — From Build to Deploy"` | `"CI/CD Pipeline from Build to Deploy"` |

### Rule: BANNED-AI-VOCABULARY

**The rule:** Never use: *delve, leverage, seamless, robust, ever-evolving, elevate, unleash, unlock, dive into, navigate*. Never use "hyper-senior" buzzwords: *mastery, expert, flawless, visionary*. Never use "junior/student" buzzwords: *learning journey, exploring, playing around*.

**Use instead:** built, configured, deployed, automated, wrote, set up, provisioned, integrated, debugged, worked around, standardized.

### Rule: TAGS-ARE-KEBAB-CASE

**The rule:** Tags are always lowercase kebab-case.

| Wrong | Correct |
|---|---|
| `CI/CD` | `ci-cd` |
| `Cloud Native` | `cloud-native` |
| `IaC` | `iac` |
| `DevSecOps` | `devsecops` |

### Rule: STAR-METHOD-SECTION-ITEMS

**The rule:** Every item in `sections[].items` must be a complete sentence starting with a strong action verb.

| Wrong | Correct |
|---|---|
| `"The pipeline has security scanning."` | `"Integrated Trivy filesystem and container image scanning to block vulnerabilities before artifacts reach the registry."` |
| `"Used Kustomize."` | `"Wrote a Kustomize overlay structure where bare-metal and EKS deployments share over 80% of the same base manifests."` |
| `"Monitoring was set up."` | `"Deployed kube-prometheus-stack for metrics. Configured AlertManager to push cluster alerts to Slack."` |

### Rule: SECTIONS-ARE-INDEPENDENT

**The rule:** Sections are completely independent and free-form. Do not restrict yourself to a fixed number of sections or a fixed set of section titles. The number of items inside any section is also fully flexible. Write the sections that match the content you have.

---

## 4. Rendering Behavior

Understanding how the YAML data renders in the UI prevents formatting mistakes.

- **`description.split("\n\n")`** produces separate `<p>` tags. A single `\n` does nothing visible. Always use `\n\n` for paragraph breaks.
- **`title`** renders in full. The UI never truncates titles or descriptions. Write complete text without worrying about length.
- **`tech[]`** items render as individual badges on project cards with staggered entrance animations.
- **`tags[]`** items render as filter chips below the tech badges. They are the primary sidebar navigation for recruiters.
- **`shortDescription`** appears on the card below the title. Two sentences keeps it scannable and prevents tech badges from being pushed off-screen on mobile.
- **`sections`** render as grouped containers on the detail page with `divide-y` separators between items.
- **`links`** render as icon buttons on both the card and the detail page. The `type` value determines the icon (FaGithub, FaBook, FaExternalLinkAlt, FaTerminal, FaImage, etc.) and the button label.

---

## 5. Pre-Commit Checklist

Before committing changes to `data/projects.yaml`:

1. Run `node scripts/generate-projects.js` to regenerate `src/data/projects.ts`
2. Run `npx tsc --noEmit` to verify TypeScript compiles clean
3. Run `npx vite build` to verify the production build passes with zero errors and zero warnings
4. Verify every `shortDescription` is exactly 2 sentences
5. Cross-reference `description` and `sections` text against `tech[]` for missing tools
6. Verify `tech[]` uses proper vendor capitalization
7. Verify `tech[]` and `tags[]` follow workflow order (not alphabetical)
8. Grep for em dashes, banned AI vocabulary, and "production" claims
9. Verify all `links[].url` values are valid and accessible
10. Verify `tags[]` uses lowercase kebab-case only
