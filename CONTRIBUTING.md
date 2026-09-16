# Contributing to Stellumio

Thank you for your interest in contributing. Stellumio is a grant-funded open-source
project building the execution layer for stablecoin value on Stellar. Every merged
contribution is credited in the grant resubmission document.

---

## Table of contents

- [Code of conduct](#code-of-conduct)
- [How to get started](#how-to-get-started)
- [Development setup](#development-setup)
- [Branching and commits](#branching-and-commits)
- [Pull request process](#pull-request-process)
- [Issue labels](#issue-labels)
- [Testing requirements](#testing-requirements)
- [Documentation requirements](#documentation-requirements)
- [Contributor ladder](#contributor-ladder)

---

## Code of conduct

All contributors are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
Violations can be reported to daveside00468@gmail.com.

---

## How to get started

1. Look for issues tagged [`good-first-issue`](https://github.com/Daveside9/stellumio/labels/good-first-issue) — these are scoped, unblocked, and reviewer-ready.
2. Comment on the issue with "I'll take this" so nobody duplicates work.
3. Fork the repository and branch off `main`.
4. Open a draft PR early — feedback during development is welcome.
5. Mark the PR ready for review when CI is green.

If you want to work on something not tracked, open an issue first with the
`feature` or `docs` label and wait for a maintainer to confirm scope before
investing time.

---

## Development setup

**Prerequisites:** Node.js 20+, npm 10+

```bash
# Clone your fork
git clone https://github.com/<your-handle>/stellumio.git
cd stellumio

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
# Edit .env.local with your values

# Start dev server
npm run dev

# Type-check
npm run typecheck

# Lint
npm run lint

# Tests
npm test
```

The app runs at `http://localhost:3000`.

---

## Branching and commits

Branch naming:

| Type        | Pattern                        | Example                          |
| ----------- | ------------------------------ | -------------------------------- |
| Feature     | `feat/<short-description>`     | `feat/sep38-quote-client`        |
| Bug fix     | `fix/<short-description>`      | `fix/amount-field-validation`    |
| Docs        | `docs/<short-description>`     | `docs/anchor-reputation`         |
| Refactor    | `refactor/<short-description>` | `refactor/corridor-selector`     |
| Test        | `test/<short-description>`     | `test/sep10-challenge-validator` |
| Chore       | `chore/<short-description>`    | `chore/update-deps`              |

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer: closes #<issue>]
```

Valid types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`.

Valid scopes: `sep10`, `sep24`, `sep38`, `anchors`, `offramp`, `router`,
`reputation`, `oracle`, `mcp`, `ui`, `api`, `config`, `tests`, `docs`, `ci`.

Examples:

```
feat(sep38): add firm-quote RFQ client

closes #071
```

```
fix(offramp): amount field rejects negative and non-numeric input

closes #007
```

---

## Pull request process

1. **One concern per PR.** A PR that mixes a feature and a refactor will be
   asked to split.
2. **CI must be green.** All checks — lint, typecheck, tests, build — must pass.
3. **Tests required.** New logic without tests will not be merged. See
   [Testing requirements](#testing-requirements).
4. **Docs required.** If you change a public interface, update the relevant
   doc file. See [Documentation requirements](#documentation-requirements).
5. **PR title must follow Conventional Commits.** The `pr-title` CI check
   enforces this.
6. **Describe what you tested.** The PR template asks for this — fill it in.

PRs are reviewed within 3 business days. If your PR has not received a review
after 5 business days, ping in the issue thread.

---

## Issue labels

| Label              | Meaning                                              |
| ------------------ | ---------------------------------------------------- |
| `good-first-issue` | Scoped, unblocked, < 2 hours of work                 |
| `help-wanted`      | Larger ticket actively looking for an owner          |
| `bug`              | Something broken                                     |
| `feature`          | New capability                                       |
| `docs`             | Documentation only                                   |
| `blocked`          | Waiting on another issue or external party           |
| `needs-triage`     | New — not yet categorised by a maintainer            |

---

## Testing requirements

- All new `lib/` code must have Vitest unit tests in `tests/`.
- New API routes must have at least one happy-path and one error-path test.
- End-to-end flows that touch Freighter or anchors should use the MSW mock
  server in `tests/mocks/`.
- Run the full suite before opening a PR: `npm test`.
- Coverage is not gated at a number today, but PRs that significantly reduce
  coverage on modified paths will be asked to add tests.

---

## Documentation requirements

The ten load-bearing doc files listed below must stay current:

| File                          | Update when…                                      |
| ----------------------------- | ------------------------------------------------- |
| `docs/ARCHITECTURE.md`        | Any module is added, removed, or its role changes |
| `docs/ROADMAP.md`             | An issue is closed or a new one is added          |
| `docs/INTENT_API.md`          | Intent schema or signing rules change             |
| `docs/ANCHOR_REPUTATION.md`   | Scoring formula or dispute process changes        |
| `docs/ORACLE_SPEC.md`         | Soroban contract interface changes                |
| `docs/MCP.md`                 | Any MCP tool is added, removed, or renamed        |
| `docs/SECURITY.md`            | Any trust boundary or disclosure path changes     |
| `docs/THREAT_MODEL.md`        | A new threat vector is identified                 |
| `docs/NON_CUSTODY.md`         | The custody boundary changes                      |
| `docs/CANONICAL_JSON.md`      | Canonicalization rules change                     |

A PR that changes code covered by one of these files without updating the file
will be asked to add the doc update before merge.

---

## Contributor ladder

| Level         | Criteria                                             | Privileges                          |
| ------------- | ---------------------------------------------------- | ----------------------------------- |
| **Triager**   | 1 merged PR                                          | Can label and triage issues         |
| **Reviewer**  | 5 merged PRs across ≥2 modules                       | Can approve PRs (second reviewer)   |
| **Maintainer**| 10 merged PRs, sustained engagement over 60 days     | Full merge rights, release signing  |

Every contributor merged during OSS Week is named in the grant resubmission
document regardless of ladder level.
