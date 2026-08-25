/**
 * Compression d'image côté navigateur.
 * Les captures SHEIN sont réduites avant d'être stockées : une photo d'iPhone
 * de 3 Mo devient ~60 Ko, ce qui reste lisible et n'explose pas le stockage.
 * (En mode Supabase, la même image part vers Supabase Storage — voir README.)
 */
export async function compressImage(file: File, maxSize = 720, quality = 0.6): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image illisible.'));
    img.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext('2d');
  if (!context) return dataUrl;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
