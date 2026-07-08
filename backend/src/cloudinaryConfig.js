import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'astonny-flyy',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

export const upload = multer({ storage: storage });

export const deleteImage = async (url) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary')) return;
  
  try {
    // Robust extraction: find 'astonny-flyy' and everything after it until the extension
    // Example: .../v12345/astonny-flyy/abc/def.jpg -> astonny-flyy/abc/def
    const regex = /\/(astonny-flyy\/[^.]+)\./;
    const match = url.match(regex);
    
    if (match && match[1]) {
      const publicId = match[1];
      console.log('Attempting to delete from Cloudinary:', publicId);
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Cloudinary Delete Result:', result);
    } else {
      // Fallback: just take the filename if folder pattern not found
      const parts = url.split('/');
      const fileName = parts[parts.length - 1].split('.')[0];
      const folder = 'astonny-flyy';
      const publicId = `${folder}/${fileName}`;
      console.log('Fallback: Attempting to delete from Cloudinary:', publicId);
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
  }
};

export { cloudinary };
