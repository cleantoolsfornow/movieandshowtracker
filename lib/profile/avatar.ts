"use client";

const AVATAR_SIZE = 192;
const AVATAR_QUALITY = 0.72;
const MAX_AVATAR_DATA_URL_LENGTH = 60_000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image."));
    };
    image.src = url;
  });
}

export async function compressAvatarFile(file: File): Promise<Blob> {
  const image = await loadImage(file);

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const offsetX = Math.floor((image.naturalWidth - sourceSize) / 2);
  const offsetY = Math.floor((image.naturalHeight - sourceSize) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Image processing is unavailable in this browser.");
  }

  context.drawImage(
    image,
    offsetX,
    offsetY,
    sourceSize,
    sourceSize,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", AVATAR_QUALITY);
  });
  if (!blob) {
    throw new Error("Could not compress image.");
  }

  return blob;
}

export async function compressAvatarToDataUrl(file: File): Promise<string> {
  const compressed = await compressAvatarFile(file);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not encode avatar."));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("Could not encode avatar."));
    reader.readAsDataURL(compressed);
  });

  if (dataUrl.length > MAX_AVATAR_DATA_URL_LENGTH) {
    throw new Error(
      "Avatar is too large after compression. Try a smaller image.",
    );
  }

  return dataUrl;
}
