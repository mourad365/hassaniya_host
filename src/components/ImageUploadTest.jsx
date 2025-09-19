import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LocalizedFileInput from '@/components/ui/LocalizedFileInput';

const ImageUploadTest = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const testUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const fileName = `test/${Date.now()}-${file.name}`;
      
      const storageZoneName = (import.meta.env.VITE_BUNNY_STORAGE_ZONE_NAME || import.meta.env.VITE_BUNNY_STORAGE_ZONE || '');
      const storagePassword = (import.meta.env.VITE_BUNNY_STORAGE_PASSWORD || import.meta.env.VITE_BUNNY_STORAGE_API_KEY || '');
      const cdnUrl = import.meta.env.VITE_BUNNY_CDN_URL || '';
      
      const uploadUrl = `https://storage.bunnycdn.com/${storageZoneName}/${fileName}`;
      console.log('Starting upload to:', uploadUrl);
      console.log('File type:', file.type);
      console.log('File size:', file.size);
      console.log('Storage zone name:', storageZoneName);
      console.log('CDN URL:', cdnUrl);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'AccessKey': storagePassword,
          'Content-Type': file.type,
        },
        body: file,
      });

      console.log('Upload response status:', uploadResponse.status);
      console.log('Upload response headers:', uploadResponse.headers);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
      }
      
      const imageUrl = `${cdnUrl}/${fileName}`;
      
      setResult({
        success: true,
        url: imageUrl,
        message: 'Upload successful!'
      });

    } catch (error) {
      console.error('Upload error:', error);
      setResult({
        success: false,
        error: error.message,
        message: 'Upload failed!'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto m-4">
      <CardHeader>
        <CardTitle>Image Upload Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LocalizedFileInput accept="image/*" onChange={(files) => setFile(files && files[0])} />
        
        <Button 
          onClick={testUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Test Upload'}
        </Button>
        
        {result && (
          <div className={`p-4 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="font-semibold">{result.message}</p>
            {result.success && (
              <div>
                <p className="text-sm text-gray-600 break-all">URL: {result.url}</p>
                <img 
                  src={result.url} 
                  alt="Uploaded test" 
                  className="mt-2 max-w-full h-auto rounded"
                  onLoad={() => console.log('Image loaded successfully')}
                  onError={(e) => console.log('Image failed to load:', e)}
                />
              </div>
            )}
            {!result.success && (
              <p className="text-sm text-red-600">{result.error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploadTest;
