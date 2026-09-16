# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| `main`  | ✅ Yes    |
| older tags | ❌ No |

We only patch security issues on the current `main` branch.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report security issues by emailing **daveside00468@gmail.com** with:

- A clear description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Any suggested mitigations (optional)

You will receive an acknowledgement within **48 hours** and a full response
within **5 business days**. We will keep you informed as the issue is
investigated and resolved.

## Non-custody guarantee

Stellumio is non-custodial by construction:

- **No user keys are ever transmitted to our servers.** All signing happens
  in the user's Freighter wallet or their own agent wallet.
- **No user funds pass through Stellumio accounts.** Payment flows directly
  from the user's Stellar account to the anchor's receiving address.
- **No fiat is handled.** Fiat settlement is entirely between the anchor and
  the user's bank or mobile-money provider.

See [`docs/NON_CUSTODY.md`](docs/NON_CUSTODY.md) for the full custody boundary
specification.

## Trust boundaries

The full threat model is documented in [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md).
The seven invariants that must hold at all times are listed in
[`docs/ARCHITECTURE.md § 9`](docs/ARCHITECTURE.md).

## Supply-chain policy

- Dependencies are pinned to exact versions in `package.json`.
- Dependabot is configured to open PRs for patch and minor updates weekly.
- All dependencies are reviewed before merge; no dependency is added without
  a documented reason.
- The `dependency-review` GitHub Actions workflow blocks PRs that introduce
  dependencies with known high or critical CVEs.

## Disclosure timeline

| Day | Action |
| --- | ------ |
| 0   | Report received — acknowledgement sent |
| 1–5 | Triage, reproduce, assess impact |
| 5–14 | Patch developed and tested |
| 14  | Patch merged, release tagged, reporter credited (if desired) |
| 14  | Public disclosure (CVE filed if warranted) |

We follow coordinated disclosure. We will not disclose before a patch is
available unless the vulnerability is already publicly known.
