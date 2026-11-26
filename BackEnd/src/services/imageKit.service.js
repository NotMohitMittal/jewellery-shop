import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadToImageKit = async (file, folder = "/jewellery-store") => {
  const response = await imagekit.upload({
    file: file.buffer, // Multer memory buffer
    fileName: `${Date.now()}-${file.originalname}`,
    folder,
  });

  return {
    url: response.url,
    fileId: response.fileId, // Save this in MongoDB so you can delete the image later
  };
};

export const deleteFromImageKit = async (fileId) => {
  if (!fileId) return;
  await imagekit.deleteFile(fileId);
};

export default imagekit;  