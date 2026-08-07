export const COVER_IMAGE_MIME_TYPE = "image/webp";
export const MAX_COVER_IMAGE_BYTES = 1 * 1024 * 1024;
export const MAX_COVER_IMAGE_DIMENSION = 1_600;

const coverImageQualities = [0.82, 0.76, 0.7, 0.64] as const;
const coverImageDimensions = [
  MAX_COVER_IMAGE_DIMENSION,
  1_200,
  960,
  720,
] as const;

type CoverImageSize = {
  height: number;
  width: number;
};

export function getResizedCoverImageSize(
  width: number,
  height: number,
  maxDimension: number,
): CoverImageSize {
  if (width <= 0 || height <= 0) {
    throw new Error("The cover image has invalid dimensions.");
  }

  const scale = Math.min(1, maxDimension / Math.max(width, height));

  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale)),
  };
}

export function getOptimizedCoverFilename(filename: string) {
  const baseName = filename.trim().replace(/\.[^/.]+$/u, "");

  return `${baseName || "cover"}.webp`;
}

export async function optimizeCoverImage(file: File): Promise<File> {
  const image = await loadCoverImage(file);

  try {
    for (const maxDimension of coverImageDimensions) {
      const { width, height } = getResizedCoverImageSize(
        image.naturalWidth,
        image.naturalHeight,
        maxDimension,
      );
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Your browser could not prepare this cover image.");
      }

      context.drawImage(image, 0, 0, width, height);

      for (const quality of coverImageQualities) {
        const blob = await canvasToWebpBlob(canvas, quality);

        if (blob.size <= MAX_COVER_IMAGE_BYTES) {
          return new File([blob], getOptimizedCoverFilename(file.name), {
            lastModified: file.lastModified,
            type: COVER_IMAGE_MIME_TYPE,
          });
        }
      }
    }
  } finally {
    URL.revokeObjectURL(image.src);
  }

  throw new Error("This cover could not be optimized below 1 MB. Please choose a simpler or smaller image.");
}

async function loadCoverImage(file: File) {
  const imageUrl = URL.createObjectURL(file);
  const image = new Image();

  image.decoding = "async";
  image.src = imageUrl;

  try {
    await image.decode();
  } catch {
    URL.revokeObjectURL(imageUrl);
    throw new Error("This cover image could not be read. Choose a JPG, PNG, or WEBP image.");
  }

  if (image.naturalWidth === 0 || image.naturalHeight === 0) {
    URL.revokeObjectURL(imageUrl);
    throw new Error("This cover image could not be read. Choose a JPG, PNG, or WEBP image.");
  }

  return image;
}

function canvasToWebpBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob || blob.type !== COVER_IMAGE_MIME_TYPE) {
        reject(new Error("Your browser could not optimize this cover image."));
        return;
      }

      resolve(blob);
    }, COVER_IMAGE_MIME_TYPE, quality);
  });
}
