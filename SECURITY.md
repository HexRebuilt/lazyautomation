# Security

## Known Vulnerabilities

| Severity    | CVE ID   | Affected Component  | Vulnerable Version | Fixed Version            | Recommendation                                                                 |
|-------------|----------|---------------------|--------------------|--------------------------|-------------------------------------------------------------------------------|
| **Low**     | N/A      | sourcemap-codec       | 1.4.8               | Use @jridgewell/sourcemap-codec | Update to the recommended package or use a modern alternative.
| **Moderate**| N/A      | rollup-plugin-terser  | 7.0.2               | Use @rollup/plugin-terser   | Replace with the updated package and ensure compatibility with Rollup v2+.    |
| **Low**     | N/A      | glob                  | 7.2.3               | Update to latest version   | Address widely publicized security vulnerabilities in older versions of `glob`.|
| **Low**     | N/A      | rimraf                | 3.0.2               | Use v4 or later            | Upgrade to a supported version for better reliability and security fixes.

## Risk Acceptance

### Decisions to Block Release

If there are no available fixes for high or critical vulnerabilities, the following process must be followed:

1. **Document the Decision**:
   - **Date**: [Today's date]
   - **CVE ID**: [CVE-ID if applicable]
   - **Justification**: [Briefly explain why the risk is acceptable, e.g., "No exploit detected in production."]
   - **Mitigation Plan**: [Steps to monitor and mitigate the risk, e.g., "Regular security audits, network isolation."]

2. **Create `security/risk-acceptance.md`**:
   This document must be created before the release is allowed.
   Example:

```markdown
---
title: Risk Acceptance Decision for Critical Vulnerability
date: 2026-03-08
status: Draft (or Approved)

## CVE Details

| Field         | Value                          |
|---------------|--------------------------------|
| CVE ID        | [CVE-ID, if applicable]          |
| Severity      | Critical / High                  |
| Affected Component | [Component name]               |

## Risk Assessment
- **Justification**: [Explain why the risk is being accepted. This might include lack of exploit in production, lack of a public patch, or other mitigations.]

## Mitigation Plan
1. [Action Item 1]
2. [Action Item 2]
3. [Action Item 3]

## Approval
- Date: [Approval date]
- Approved by: [Name and role of approver]
```