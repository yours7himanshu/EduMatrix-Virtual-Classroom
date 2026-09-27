# Contributing to EduMatrix Virtual Classroom

Thanks for contributing to EduMatrix. This guide explains the expected workflow for issues, branches, and pull requests.

## Ways to contribute

- Report bugs
- Propose enhancements
- Improve documentation
- Add or fix features
- Improve tests and reliability

## Getting started

1. Fork the repository.
2. Clone your fork.
3. Create a feature branch from the latest default branch.
4. Set up the project using the steps in [README.md](README.md).

## Branch naming

Use clear branch prefixes:

- `feature/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `chore/<short-description>`

Examples:

- `feature/live-attendance-filter`
- `fix/payment-webhook-validation`
- `docs/readme-quickstart`

## Development expectations

- Keep changes focused and minimal.
- Follow existing project style and patterns.
- Avoid unrelated refactors in the same PR.
- Update docs when behavior/setup changes.

## Validation before opening a PR

Run checks relevant to the area you changed:

```bash
npm test --prefix server
npm run lint --prefix client
npm run lint --prefix admin
```

If your change touches only docs, code checks are optional.

## Pull request checklist

- [ ] Branch is up to date with the target branch
- [ ] Scope is focused and clearly described
- [ ] Relevant tests/lint checks pass locally
- [ ] Docs/config were updated where needed
- [ ] No secrets or credentials were added

## Reporting bugs

When opening a bug report, include:

- A short summary
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs (if available)
- Environment details (OS, Node version, browser)

## Security

Do not open public issues for sensitive security vulnerabilities. Use private/coordinated disclosure with repository maintainers.

## License

By contributing, you agree your contributions are licensed under Apache License 2.0, consistent with this repository.
