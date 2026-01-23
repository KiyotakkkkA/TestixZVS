import { useId, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

import type React from "react";

export interface InputMediaProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
    label?: string;
    helperText?: string;
    value?: File[];
    onChange?: (files: File[]) => void;
}

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
};

export const InputMedia = ({
    label,
    helperText,
    value,
    onChange,
    className,
    disabled,
    id,
    multiple = true,
    accept,
    ...props
}: InputMediaProps) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const [internalFiles, setInternalFiles] = useState<File[]>([]);

    const files = value ?? internalFiles;

    const acceptLabel = useMemo(() => {
        if (!accept) return 'Любые файлы';
        return accept.split(',').map((item) => item.trim()).join(', ');
    }, [accept]);

    const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(event.target.files ?? []);
        if (!value) {
            setInternalFiles(selected);
        }
        onChange?.(selected);
    };

    const handleRemoveFile = (fileToRemove: File) => {
        const nextFiles = files.filter(
            (file) => !(file.name === fileToRemove.name && file.lastModified === fileToRemove.lastModified)
        );
        if (!value) {
            setInternalFiles(nextFiles);
        }
        onChange?.(nextFiles);
    };

    return (
        <div className={`w-full ${className ?? ''}`}>
            {label && (
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {label}
                </div>
            )}
            <label
                htmlFor={inputId}
                className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-indigo-300 bg-white/70 px-4 py-6 text-center text-sm text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50 ${
                    disabled ? 'cursor-not-allowed opacity-60' : ''
                }`}
            >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50">
                    <Icon icon="mdi:plus" className="h-6 w-6" />
                </span>
                <div className="font-semibold">Прикрепить файл</div>
                <div className="text-xs text-indigo-400">Поддерживаемые типы: {acceptLabel}</div>
                {helperText && <div className="text-xs text-slate-400">{helperText}</div>}
            </label>
            <input
                id={inputId}
                type="file"
                multiple={multiple}
                accept={accept}
                disabled={disabled}
                onChange={handleFilesChange}
                className="hidden"
                {...props}
            />

            {files.length > 0 && (
                <div className="mt-3 space-y-2">
                    {files.map((file) => (
                        <div
                            key={`${file.name}-${file.lastModified}`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <Icon icon="mdi:file-outline" className="h-4 w-4 text-indigo-400" />
                                <span className="truncate text-slate-700">{file.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400">{formatFileSize(file.size)}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFile(file)}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                                    aria-label={`Удалить файл ${file.name}`}
                                >
                                    <Icon icon="mdi:close" className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
