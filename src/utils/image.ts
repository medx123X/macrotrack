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
