import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * LocalizedFileInput
 * - Hides the native browser label (which is not localizable)
 * - Shows a custom, translated button and filename text
 *
 * Props:
 * - name?: string
 * - accept?: string
 * - multiple?: boolean
 * - disabled?: boolean
 * - className?: string (container)
 * - buttonClassName?: string
 * - textClassName?: string
 * - onChange?: (FileList) => void
 */
const LocalizedFileInput = ({
  name,
  accept,
  multiple = false,
  disabled = false,
  className = '',
  buttonClassName = '',
  textClassName = '',
  onChange,
}) => {
  const { t, i18n } = useTranslation();
  const inputRef = useRef(null);
  const [files, setFiles] = useState(null);

  const isRTL = i18n.language === 'ar';

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const selected = e.target.files;
    setFiles(selected);
    onChange?.(selected);
  };

  const fileNames = () => {
    if (!files || files.length === 0) return t('upload.noFile');
    if (files.length === 1) return files[0].name;
    return Array.from(files).map(f => f.name).join(', ');
  };

  return (
    <div className={`w-full ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
        className="hidden"
      />

      <div className={`flex items-center ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} gap-3`}>
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={`px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm shadow-sm ${buttonClassName}`}
        >
          {t('upload.choose')}
        </button>
        <span className={`text-sm text-gray-600 truncate ${textClassName}`}>
          {fileNames()}
        </span>
      </div>
    </div>
  );
};

export default LocalizedFileInput;
