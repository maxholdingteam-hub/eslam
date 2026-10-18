# Triage rules

For each item, ask in order:

1. **Is it still true?** Read the surrounding code and `git log -L` for the lines. If the issue is gone, delete the comment.
2. **Is it under 30 minutes?** Fix it now in a small PR that removes the comment.
3. **Is it a bug or a risk?** (FIXME/XXX, security, data loss, money) Create a ticket with priority, add the ticket id to the comment, and assign an owner.
4. **Is it a workaround?** (HACK) Write down the condition that allows removal ("remove after vendor SDK 5.x") and a due date.
5. **Is it a wish?** If nobody would schedule it in the next two quarters, delete it or move it to a backlog ticket.

## Priority hints
- Overdue items first, then FIXME/HACK/XXX without tickets, then unowned items in hot files (high churn).
- Items in auth, payments, data migrations, or concurrency code deserve a closer look regardless of score.

## Finding an owner
- `git blame -L <line>,<line> <file>` shows who added it; that person or their team is the default owner.
- CODEOWNERS files map paths to teams.
- If the author has left, assign to the current maintainer of the module.