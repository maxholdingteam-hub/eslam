---
name: todo-comment-debt-tracker
description: Scans a codebase for TODO, FIXME, HACK, and XXX comments, extracts owner, ticket, and due date, and flags unowned, untracked, overdue, or vague items with a priority score. Use when cleaning up tech debt, before a release, or asking "which TODOs actually matter?". Includes a stdlib Python scanner with --self-test and a CI-friendly exit code.
---

# TODO Comment Debt Tracker

You help teams turn scattered TODO, FIXME, HACK, and XXX comments into a short, owned, prioritized debt list. You scan the code, parse who owns each item, which ticket tracks it, and when it is due, then highlight the ones that are risky or forgotten. You never delete or rewrite comments on your own; you propose changes and let the team decide.

## Files in this skill

- `scripts/todo_debt.py` - scans files or directories, parses owner/ticket/due date, scores each item, and prints a markdown table or JSON (Python 3 standard library only)
- `references/comment-conventions.md` - a recommended TODO format and how to adopt it without churn
- `references/triage-rules.md` - how to decide fix now, ticket, or delete
- `templates/debt-report.md` - report for a sprint review, release checklist, or PR comment
- `examples/sample_service.py` - a small file with typical good and bad TODOs for demos

## Workflow

### 1. Scope the scan
Ask which directories matter and what to skip (generated code, vendored libraries, fixtures). The script already skips `.git`, `node_modules`, `vendor`, `dist`, `build`, virtualenvs, and `target`.

### 2. Run the scanner
```
python3 scripts/todo_debt.py src/ --today 2026-10-18
python3 scripts/todo_debt.py src/ tests/ --ext .py,.ts --json > todo-debt.json
python3 scripts/todo_debt.py examples/sample_service.py --strict
python3 scripts/todo_debt.py --self-test
```
Exit code 1 when an item is overdue or a FIXME/HACK/XXX has no ticket (`--strict`: any problem). Use it as a soft CI gate or a weekly report job.

### 3. Read the problems
- **overdue**: due date passed. Highest priority.
- **no_ticket**: nothing tracks the work; it will be forgotten.
- **stale_hack**: a HACK or XXX with no ticket, often a workaround that outlived its reason.
- **no_owner**: nobody is responsible.
- **vague**: fewer than three words, such as "TODO: fix".

Scores: FIXME/HACK/XXX start at 3, TODO at 1; +2 if overdue, +1 if no ticket.

### 4. Triage with the team
Apply `references/triage-rules.md`: fix now if it is under 30 minutes, create a ticket and add its id if it is real work, delete it if it is obsolete. Use `git blame` on the line to find a likely owner when none is written.

### 5. Report
Fill `templates/debt-report.md` with the top items, totals by marker and owner, and agreed actions. Suggest the convention in `references/comment-conventions.md` for new comments.

## Rules

- Do not count markers inside string literals or plain prose; only comments.
- Never invent ticket numbers or owners; mark them unknown and suggest how to find them.
- Do not remove comments in bulk without review; propose a patch instead.
- Respect generated and vendored code: report it separately or skip it.