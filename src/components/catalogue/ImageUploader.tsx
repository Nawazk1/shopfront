'use client';

import React, { useCallback, useRef, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { ProductImage } from '@/lib/catalogueStore';

interface ImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    setUploadError('');
    const selectedFiles = Array.from(files);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (selectedFiles.some(file => !allowedTypes.includes(file.type))) {
      setUploadError('Use JPG, PNG, WEBP or GIF images.');
      return;
    }
    if (selectedFiles.some(file => file.size > 3 * 1024 * 1024)) {
      setUploadError('Each image must be 3 MB or smaller.');
      return;
    }
    if (images.length + selectedFiles.length > 8) {
      setUploadError('You can add up to 8 product images.');
      return;
    }
    if (selectedFiles.reduce((total, file) => total + file.size, 0) > 24 * 1024 * 1024) {
      setUploadError('The selected images exceed the 24 MB upload limit.');
      return;
    }

    try {
      const newImages = await Promise.all(selectedFiles.map(file => new Promise<ProductImage>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
          url: reader.result as string,
          alt: file.name.replace(/\.[^/.]+$/, ''),
          isMain: false,
        });
        reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
        reader.readAsDataURL(file);
      })));
      if (images.length === 0 && newImages.length > 0) newImages[0].isMain = true;
      onChange([...images, ...newImages]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not read the selected images.');
    }
  }, [images, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const setMainImage = (id: string) => {
    onChange(images.map(img => ({ ...img, isMain: img.id === id })));
  };

  const removeImage = (id: string) => {
    const filtered = images.filter(img => img.id !== id);
    if (filtered.length > 0 && !filtered.some(img => img.isMain)) {
      filtered[0].isMain = true;
    }
    onChange(filtered);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { void processFiles(e.target.files); e.target.value = ''; }}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDragging ? 'bg-primary/10' : 'bg-gray-100'}`}>
            <Icon name="CloudArrowUpIcon" size={28} className={isDragging ? 'text-primary' : 'text-gray-400'} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">
              {isDragging ? 'Drop images here' : 'Drag & drop images or click to browse'}
            </p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP or GIF · 3 MB max each · up to 8 images</p>
          </div>
        </div>
      </div>
      {uploadError && <p role="alert" className="text-sm font-medium text-red-600">{uploadError}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map(img => (
            <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors">
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMainImage(img.id); }}
                  title="Set as main"
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-yellow-50 transition-colors"
                >
                  <Icon name={img.isMain ? 'StarIcon' : 'StarIcon'} size={14} variant={img.isMain ? 'solid' : 'outline'} className={img.isMain ? 'text-yellow-500' : 'text-gray-600'} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                  title="Remove"
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                >
                  <Icon name="TrashIcon" size={14} className="text-red-500" />
                </button>
              </div>
              {img.isMain && (
                <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
