import axios from 'axios';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

export const ImageUploadService = {
  async uploadToImgBB(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData);
    return response.data.data.url;
  },

  async uploadToCloudinary(file: File): Promise<string> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // You might need to set this up in Cloudinary
    
    // Cloudinary usually requires an unsigned upload preset for client-side uploads
    const response = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
    return response.data.secure_url;
  }
};
