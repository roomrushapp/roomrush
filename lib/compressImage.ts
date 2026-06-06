import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.45,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/webp" as const,
    initialQuality: 0.82,
  };

  try {
    const compressed = await imageCompression(file, options);
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    return new File([compressed], `${baseName}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

export async function compressListingImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1800,
    useWebWorker: true,
    fileType: "image/webp" as const,
    initialQuality: 0.84,
  };

  try {
    const compressed = await imageCompression(file, options);
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    return new File([compressed], `${baseName}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}
