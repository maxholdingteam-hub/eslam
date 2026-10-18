"""Sample order service with typical TODO comments for demos of todo_debt.py."""
import json

TAX_RATE = 0.2  # XXX(PAY-311): confirm tax rate per region with finance


def load_orders(path):
    # TODO(maria, 2026-03-01): switch to streaming parser once files exceed 50 MB (#88)
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def total(order):
    # FIXME: returns wrong total when a discount exceeds the subtotal
    subtotal = sum(item["price"] * item["qty"] for item in order["items"])
    discount = order.get("discount", 0)
    return round((subtotal - discount) * (1 + TAX_RATE), 2)


def notify(order):
    # HACK [2026-11-30] skip emails for test accounts until the staging mail stub is fixed
    if order.get("email", "").endswith("@test.local"):
        return False
    # TODO: retry
    return True


def label(order):
    note = "TODO: this string is not a comment and should be ignored"
    # TODO(@ken, OPS-19): move label printing to the warehouse service
    return f"{order['id']} {note[:0]}"