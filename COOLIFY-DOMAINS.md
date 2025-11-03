# Coolify Domain Configuration Guide

## Domain Recommendations

### ✅ Services That Need Domains

| Service | Recommended Domain | Target Port | Purpose |
|---------|-------------------|-------------|---------|
| **MinIO** | `https://minio.val-x.com` | `9000` | MinIO Console & API access |

### ⚠️ Services That Don't Need Domains

These are background services that run internally and don't need public access:

| Service | Domain | Reason |
|---------|--------|--------|
| **MinIO-Init** | Leave **BLANK** or `https://minio-init.val-x.com` | One-time initialization service, runs on startup |
| **MinIO-Sync** | Leave **BLANK** or `https://minio-sync.val-x.com` | Background sync service, no user interface |

## 📝 Step-by-Step Configuration

### 1. MinIO Domain (Required)

1. Find **"Domains for minio"** section
2. Enter: `https://minio.val-x.com`
3. Click **"Generate Domain"** or enter manually
4. **Important:** After saving, verify the **Target Port** is set to `9000` in Coolify settings
5. Wait 2-3 minutes for SSL certificate generation

### 2. MinIO-Init Domain (Optional)

**Option A: Leave Blank (Recommended)**
- If Coolify allows, leave this field **empty**
- This service only runs once at startup to create buckets
- No public access needed

**Option B: Use Placeholder**
- If Coolify **requires** a domain:
  - Enter: `https://minio-init.val-x.com`
  - This is just a placeholder - you won't access it directly

### 3. MinIO-Sync Domain (Optional)

**Option A: Leave Blank (Recommended)**
- If Coolify allows, leave this field **empty**
- This is a background service that syncs files every 5 minutes
- No public access needed

**Option B: Use Placeholder**
- If Coolify **requires** a domain:
  - Enter: `https://minio-sync.val-x.com`
  - This is just a placeholder - you won't access it directly

## 🔧 After Configuration

### Verify MinIO Access

1. Wait 3-5 minutes for SSL certificate generation
2. Access MinIO Console: `https://minio.val-x.com`
3. Login with:
   - **Username:** `minioadmin`
   - **Password:** `minioadmin`
   - ⚠️ **Change these in production!**

### Verify Target Port

For MinIO domain, ensure Coolify has:
- **Target Port:** `9000` (not 9001)
- **Protocol:** `http` (Coolify handles HTTPS)

## 📊 Complete Domain List

After configuration, you should have:

| Service | Domain | Status |
|---------|--------|--------|
| ErsatzTV | `https://tv.val-x.com` | ✅ Configured |
| AzuraCast | `https://fm.val-x.com` | ✅ Configured |
| Jellyfin | `https://play.val-x.com` | ✅ Configured |
| **MinIO** | `https://minio.val-x.com` | ⬅️ **Add this** |
| MinIO-Init | *(blank or placeholder)* | Optional |
| MinIO-Sync | *(blank or placeholder)* | Optional |

## 🎯 Quick Answer

**Fill these fields:**

1. **Domains for minio:** `https://minio.val-x.com`
2. **Domains for minio-init:** *(Leave blank if possible)*
3. **Domains for minio-sync:** *(Leave blank if possible)*

If Coolify requires domains for all services, use:
- `https://minio.val-x.com` for MinIO
- `https://minio-init.val-x.com` for MinIO-Init (placeholder)
- `https://minio-sync.val-x.com` for MinIO-Sync (placeholder)

## 🔒 Security Note

After accessing MinIO console for the first time, **immediately change the default password**:
1. Go to MinIO Console → Identity → Users
2. Change `minioadmin` password
3. Update `docker-compose.yml` with new credentials
4. Redeploy services

