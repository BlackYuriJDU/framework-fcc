# Knowledge Freshness v8

External references are evidence, not permanent truth. Every curated source should carry provenance and freshness metadata (`verifiedAt`, `expiresAt`, authority).

Status:
- `fresh`: now < expiresAt
- `stale`: now >= expiresAt and < 2x validity window
- `expired`: now >= verifiedAt + 2x validity window

Freshness never invalidates history; it changes retrieval priority and requires re-verification before high-risk decisions.
