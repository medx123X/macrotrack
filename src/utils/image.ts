/**
 * Resizes and compresses an image file entirely client-side (no upload, no
 * server) and returns it as a base64 data URL ready to store on the Profile
 * object. Keeps stored size small since this ends up in IndexedDB and in the
 * full JSON export/import.
 */
export function fileToResizedDataUrl(file: File, maxDimension = 256, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode the selected image.'));
      img.onload = () => {
        // Centered square crop of the source, then scaled down to maxDimension —
        // keeps avatars consistent in circular frames regardless of source aspect ratio.
        const sourceSide = Math.min(img.width, img.height);
        const sx = (img.width - sourceSide) / 2;
        const sy = (img.height - sourceSide) / 2;
        const destSide = Math.min(maxDimension, sourceSide);

        const canvas = document.createElement('canvas');
        canvas.width = destSide;
        canvas.height = destSide;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported.'));
          return;
        }
        ctx.drawImage(img, sx, sy, sourceSide, sourceSide, 0, 0, destSide, destSide);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Resizes an image file (preserving aspect ratio, no cropping) and returns
 * both a data URL for local preview and the raw base64 + mimeType needed to
 * send it to Gemini's vision API. Used for "attach a photo" in the assistant
 * (nutrition labels, packaging, plates of food, etc.) — as opposed to
 * fileToResizedDataUrl above, which square-crops for avatars.
 */
export function fileToBase64Image(
  file: File,
  maxDimension = 1024,
  quality = 0.85
): Promise<{ dataUrl: string; base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode the selected image.'));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const destW = Math.round(img.width * scale);
        const destH = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = destW;
        canvas.height = destH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported.'));
          return;
        }
        ctx.drawImage(img, 0, 0, destW, destH);

        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const base64 = dataUrl.split(',')[1] ?? '';
        resolve({ dataUrl, base64, mimeType });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
