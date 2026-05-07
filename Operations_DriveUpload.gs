// ─────────────────────────────────────────────────────────────────────────────
// Operations_DriveUpload.gs
// Resumable chunked upload to Google Drive — supports large files (videos, etc.)
//
// Wired in Operation.gs doPost:
//   drive_create_upload_session → driveCreateUploadSession(body)
//   drive_upload_chunk          → driveUploadChunk(body)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Phase 1: create a Drive resumable upload session.
 * Creates the destination subfolder, then initiates the session.
 * Returns { ok, uploadUrl, folderId, folderUrl }
 */
function driveCreateUploadSession(body) {
  try {
    var filename   = body.filename   || 'untitled';
    var mimeType   = body.mimeType   || 'application/octet-stream';
    var fileSize   = body.fileSize   || 0;
    var sourceType = body.sourceType || 'shared';
    var sourceId   = body.sourceId   || '';
    var sourceName = body.sourceName || '';
    var category   = body.category   || '';

    // Resolve destination folder in Shared Drive
    var root      = DriveApp.getFolderById(SHARED_DRIVE_FOLDER_ID);
    var bucketName = sourceType === 'task' ? 'RACI Task Docs' : sourceType === 'agenda' ? 'Agenda' : 'Team Documents';
    var bucket    = _duGetOrCreate(root, bucketName);
    var label     = (sourceName || sourceId || 'Unknown')
      .replace(/[\/\\:*?"<>|]/g, '').trim().substring(0, 80) || (sourceId || 'misc');
    var subfolder = _duGetOrCreate(bucket, label);
    if (category) subfolder = _duGetOrCreate(subfolder, category);

    var folderId = subfolder.getId();
    var token    = ScriptApp.getOAuthToken();
    var metadata = JSON.stringify({ name: filename, parents: [folderId] });

    var resp = UrlFetchApp.fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
      {
        method:  'post',
        headers: {
          'Authorization':           'Bearer ' + token,
          'Content-Type':            'application/json; charset=UTF-8',
          'X-Upload-Content-Type':   mimeType,
          'X-Upload-Content-Length': String(fileSize)
        },
        payload:            metadata,
        muteHttpExceptions: true
      }
    );

    var uploadUrl = resp.getHeaders()['Location'] || resp.getHeaders()['location'] || '';
    if (!uploadUrl) {
      return { ok: false, error: 'Drive did not return upload URL. HTTP ' + resp.getResponseCode() + ': ' + resp.getContentText().substring(0, 200) };
    }

    return { ok: true, uploadUrl: uploadUrl, folderId: folderId, folderUrl: subfolder.getUrl() };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Phase 2: upload one chunk to the resumable session.
 * Returns { ok, done, fileId } where done=true on the final chunk.
 */
function driveUploadChunk(body) {
  try {
    var uploadUrl = body.uploadUrl   || '';
    var b64chunk  = body.base64chunk || '';
    var offset    = body.offset      || 0;
    var totalSize = body.totalSize   || 0;
    var mimeType  = body.mimeType    || 'application/octet-stream';

    if (!uploadUrl) return { ok: false, error: 'uploadUrl is required' };

    var bytes    = Utilities.base64Decode(b64chunk);
    var chunkEnd = offset + bytes.length - 1;
    var token    = ScriptApp.getOAuthToken();

    var resp = UrlFetchApp.fetch(uploadUrl, {
      method:  'put',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Range': 'bytes ' + offset + '-' + chunkEnd + '/' + totalSize,
        'Content-Type':  mimeType
      },
      payload:            bytes,
      muteHttpExceptions: true
    });

    var code = resp.getResponseCode();
    if (code === 200 || code === 201) {
      var parsed = JSON.parse(resp.getContentText());
      return { ok: true, done: true, fileId: parsed.id };
    }
    if (code === 308) {
      return { ok: true, done: false };
    }
    return { ok: false, error: 'Unexpected HTTP ' + code + ': ' + resp.getContentText().substring(0, 200) };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

function _duGetOrCreate(parent, name) {
  var iter = parent.getFoldersByName(name);
  return iter.hasNext() ? iter.next() : parent.createFolder(name);
}
