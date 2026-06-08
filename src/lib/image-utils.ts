export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export const convertImage = async (file: File, format: 'jpeg' | 'webp' = 'jpeg', customName?: string): Promise<{ url: string, name: string, size: number, originalSize: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Gagal mendapatkan context canvas'));
        
        // Fill white background for transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image
        ctx.drawImage(img, 0, 0);
        
        // Export to requested format with 0.92 quality (standard good quality)
        const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, 0.92);
        
        // Calculate new size (approximate for base64)
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const padding = (dataUrl.charAt(dataUrl.length - 2) === '=') ? 2 : ((dataUrl.charAt(dataUrl.length - 1) === '=') ? 1 : 0);
        const sizeInBytes = (base64Length * 3) / 4 - padding;

        const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
        const baseOutputName = customName ? customName : `${originalName}-hasil`;
        const newName = `${baseOutputName}.${format}`;
        
        resolve({ url: dataUrl, name: newName, size: sizeInBytes, originalSize: file.size });
      };
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
};
