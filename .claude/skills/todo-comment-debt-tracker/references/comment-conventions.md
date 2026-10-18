# Recommended TODO convention

```
# TODO(owner, TICKET-123, 2026-12-01): what needs to happen and why
```

- **owner**: a username or team handle (`alice`, `@payments-team`). One name, the person who will make the call.
- **ticket**: `#123`, `PROJ-123`, or a full issue URL. Required for FIXME, HACK, and XXX.
- **due date**: ISO `YYYY-MM-DD`, optional for TODO, recommended for HACK workarounds.
- **text**: an action plus the reason, at least a short sentence. "TODO: fix" is not useful.

## Which marker to use
| Marker | Meaning | Ticket required? |
|---|---|---|
| TODO | Planned improvement, not wrong today | Recommended |
| FIXME | Known bug or incorrect behavior | Yes |
| HACK | Deliberate workaround that should be removed | Yes, plus a due date |
| XXX | Danger, surprising code, review needed | Yes |

## Adopting without churn
1. Run the scanner and publish the report; do not mass-edit.
2. Apply the convention to new comments via code review or a lint rule.
3. Fix old comments when you touch that code anyway.
4. Revisit the totals monthly; aim for "no overdue, no untracked FIXME".