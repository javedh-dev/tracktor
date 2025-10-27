# File Upload Integration Guide

This document explains how the file upload functionality is integrated between the frontend and backend.

## Backend Implementation

### File Upload Middleware (`app/backend/src/middleware/file-upload.ts`)
- Uses `multer` for handling multipart/form-data
- Stores files in `./uploads` directory with UUID-based filenames
- Supports files up to 10MB
- Validates file types (images, PDFs, documents)
- Automatically creates uploads directory if it doesn't exist

### Upload Routes (`app/backend/src/routes/uploadRoutes.ts`)
- `POST /api/upload` - Upload a file
- `GET /api/upload/:filename` - Download/view uploaded file
- Both endpoints require PIN authentication
- Returns JSON responses with upload status and file metadata

### Response Format
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "filename": "uuid-generated-filename.ext",
  "originalName": "original-filename.ext",
  "size": 1024,
  "mimetype": "image/jpeg"
}
```

## Frontend Implementation

### File Service (`app/frontend/src/lib/services/file.service.ts`)
- `uploadFile(file: File)` - Uploads a file to the server
- `downloadFile(filename: string)` - Downloads a file from the server
- Handles authentication via X-User-PIN header
- Returns typed responses with error handling

### UI Components

#### FileDropZone (`app/frontend/src/lib/components/ui/file-drop-zone/`)
- Generic drag-and-drop file upload component
- Supports multiple files, file type validation, size limits
- Customizable with callbacks for upload and rejection handling

#### ImageDropZone (`app/frontend/src/lib/components/ui/file-drop-zone/image-drop-zone.svelte`)
- Specialized for single image uploads
- Shows image preview after selection
- Used in vehicle forms for vehicle images

## Integration Examples

### Basic File Upload
```svelte
<script>
  import { FileDropZone } from '$lib/components/ui/file-drop-zone';
  import { uploadFile } from '$lib/services/file.service';
  import { toast } from 'svelte-sonner';

  const handleUpload = async (files) => {
    for (const file of files) {
      const result = await uploadFile(file);
      if (result.success) {
        toast.success(`${file.name} uploaded successfully!`);
      } else {
        toast.error(`Upload failed: ${result.message}`);
      }
    }
  };
</script>

<FileDropZone
  onUpload={handleUpload}
  maxFileSize={10 * 1024 * 1024}
  accept="image/*,.pdf,.doc,.docx"
/>
```

### Image Upload with Preview
```svelte
<script>
  import { ImageDropZone } from '$lib/components/ui/file-drop-zone/image-drop-zone.svelte';
  import { uploadFile } from '$lib/services/file.service';

  let imageSrc = $state();
  let uploadedFilename = $state();

  const selectFile = async (file) => {
    const result = await uploadFile(file);
    if (result.success) {
      uploadedFilename = result.filename;
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        imageSrc = e.target?.result;
      };
      reader.readAsDataURL(file);
    }
  };
</script>

<ImageDropZone onSelect={selectFile} bind:imageSrc />
```

## Current Integration

The file upload is currently integrated in:

1. **Vehicle Form** - Users can upload vehicle images when adding/editing vehicles
2. **Backend API** - Handles file storage and retrieval with proper authentication

## Security Features

- PIN-based authentication required for all file operations
- File type validation on both frontend and backend
- File size limits (10MB default)
- UUID-based filenames prevent directory traversal
- Uploads directory is gitignored to avoid committing files

## File Storage

- Files are stored in `./uploads` directory on the backend
- Filenames are UUID-based to prevent conflicts and enhance security
- Original filenames are preserved in the database/response metadata
- Files can be retrieved via the `/api/upload/:filename` endpoint

## Error Handling

- Network errors are caught and displayed to users
- File validation errors show specific messages
- Server errors return appropriate HTTP status codes
- Frontend shows toast notifications for all upload states

## Future Enhancements

- File deletion endpoint
- Image resizing/optimization
- Cloud storage integration (S3, etc.)
- Progress indicators for large file uploads
- Batch upload operations