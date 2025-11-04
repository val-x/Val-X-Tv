# Bucket Name Migration Guide

## Overview

Bucket names have been updated to comply with MinIO requirements (minimum 3 characters).

## Changes

| Old Bucket Name | New Bucket Name | Reason |
|----------------|-----------------|--------|
| `fm` | `fm-radio` | MinIO requires 3+ character bucket names |
| `tv` | `tv-shows` | MinIO requires 3+ character bucket names |

## Impact

### Code Changes
- ✅ Updated `functions/utils/minio.ts` - bucket constants changed
- ✅ All code using `buckets.FM` and `buckets.TV` automatically uses new names
- ✅ API endpoints remain unchanged: `/fm/list` and `/tv/list` still work

### Documentation
- ✅ Updated `README.md` - bucket structure documentation
- ✅ Updated `DEPLOYMENT.md` - bucket verification list
- ✅ Updated `PRODUCTION.md` - bucket policy paths

### Migration Steps

#### For New Deployments
No action needed - new deployments will automatically create buckets with new names.

#### For Existing Deployments

If you have existing data in old buckets:

1. **Backup existing data:**
   ```bash
   # Export data from old buckets
   mc cp --recursive minio/fm /backup/fm/
   mc cp --recursive minio/tv /backup/tv/
   ```

2. **Create new buckets** (will be auto-created on next API call):
   ```bash
   # Or manually via MinIO console
   mc mb minio/fm-radio
   mc mb minio/tv-shows
   ```

3. **Migrate data:**
   ```bash
   # Copy data to new buckets
   mc cp --recursive /backup/fm/ minio/fm-radio/
   mc cp --recursive /backup/tv/ minio/tv-shows/
   ```

4. **Update bucket policies** in MinIO console:
   - Remove policies from old `fm` and `tv` buckets
   - Add policies to new `fm-radio` and `tv-shows` buckets
   - Public read for `/fm-radio/` and `/tv-shows/` only

5. **Delete old buckets** (after verification):
   ```bash
   mc rm --recursive --force minio/fm
   mc rm --recursive --force minio/tv
   ```

## Coolify Environment

**No environment variable changes needed** - bucket names are hardcoded in the application code, not in environment variables.

The bucket names are defined in `functions/utils/minio.ts`:
```typescript
export const buckets = {
  FM: 'fm-radio',
  TV: 'tv-shows',
  // ... other buckets
};
```

## Verification

After deployment, verify new buckets exist:

```bash
# List all buckets
mc ls minio/

# Should see:
# fm-radio/
# tv-shows/
# users/
# videos/
# audio/
# courses/
# subscriptions/
# thumbnails/
```

## API Compatibility

✅ **Backward Compatible**: API endpoints remain unchanged:
- `GET /fm/list` - Still works, now reads from `fm-radio` bucket
- `GET /tv/list` - Still works, now reads from `tv-shows` bucket

No client code changes required.

## Notes

- Bucket names are internal implementation details
- API endpoints (`/fm/list`, `/tv/list`) remain unchanged
- No breaking changes for API consumers
- Migration only needed if you have existing data in old buckets

