# Incident Report: Data Loss in JSONB Migration (2026-01-28)

## Executive Summary

A faulty migration attempting to remove legacy `bible-graph://` protocol links resulted in data loss in 1 study. The migration used overly complex JSONB manipulation that caused `content = NULL` when the expected JSON structure wasn't found.

**Impact**: 1 study lost (~5KB of content, likely 1000+ words)
**Resolution Time**: ~30 minutes
**Root Cause**: JSONB complexity anti-pattern, insufficient staging testing

## What Happened

1. **Phase 3 Refactoring** (successful)
   - Removed `bible-graph://` protocol support from code
   - Updated tests and handler logic
   - Code was ready

2. **Migration to Convert Legacy Data** (problematic)
   - Created migration to replace `bible-graph://study/uuid` with `/estudo/uuid` in stored JSONB
   - Used complex JSONB manipulation with subqueries
   - NOT tested in staging database

3. **Bug in JSONB Logic**
   - JSONB aggregation returned NULL when WHERE clause didn't find matching blocks
   - NULL propagated to UPDATE, setting `content = NULL`
   - 1 study affected: `b72da027-fc18-48f3-9c3c-820673e70301`

4. **Detection and Fix**
   - User reported empty editor
   - Diagnosed NULL content in database
   - Applied fix migration with safer string replacement
   - Reset affected study to empty document structure

## Root Cause

**JSONB Complexity Trap**: Attempting to use complex JSONB manipulation for a simple string replacement operation, without considering edge cases or NULL propagation.

See full RCA: `~/.claude/memory/rca-migration-data-loss.md`

## Lessons Learned

1. **Always test migrations in staging** with production-like data
2. **Prefer string operations over JSONB** for text replacements
3. **Include verification queries** in migrations to validate impact
4. **Have rollback plans** before production migrations
5. **Backup before running** data-modifying migrations

## Prevention Plan

### For Future Migrations:
- [ ] Create staging database with recent production data
- [ ] Test migration fully in staging
- [ ] Run verification queries to check impact
- [ ] Document rollback procedure
- [ ] Add pre/post counts verification
- [ ] Use transactions where possible

### For JSONB Operations:
- [ ] Prefer `content::text::regexp_replace()::jsonb` over `jsonb_set()`
- [ ] Test for NULL propagation in aggregations
- [ ] Validate structure assumptions with sample data
- [ ] Add edge case tests (empty, null, malformed)

## Commits Related

- `3a3f152`: Original (faulty) migration
- `29bbf17`: Fix migration and recovery

## References

- [Phase 3 Refactoring](../stories/story-3.0-remove-legacy-protocol.md)
- [RCA Full Analysis](../../.claude/memory/rca-migration-data-loss.md)

---

**Status**: CLOSED
**Resolution**: Partial (data lost, system functional)
**Date**: 2026-01-28
**Severity**: HIGH (data loss, but limited scope)
