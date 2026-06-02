"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

type InputDropZoneProps = {
  file: File | null;
  previewUrl: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
  accept?: string;
};

const getFirstImageFile = (files: FileList | null) => {
  const file = files?.[0];

  if (!file || !file.type.startsWith("image/")) {
    return null;
  }

  return file;
};

export const InputDropZone = ({
  file,
  previewUrl,
  onChange,
  accept = "image/*",
}: InputDropZoneProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFile = (nextFile: File | null) => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    onChange(nextFile, nextFile ? URL.createObjectURL(nextFile) : null);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFile(getFirstImageFile(event.dataTransfer.files));
        }}
        className={[
          "flex min-h-32 w-full items-center justify-center rounded-md border border-dashed p-4 text-left transition",
          isDragging
            ? "border-main-300 bg-main-800/70"
            : "border-main-700/80 bg-transparent hover:border-main-500 hover:bg-main-800/35",
        ].join(" ")}
      >
        {previewUrl ? (
          <span className="grid w-full gap-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
            <span className="h-28 overflow-hidden rounded-md border border-main-700/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Предпросмотр изображения вопроса"
                className="h-full w-full object-cover"
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-main-50">
                {file?.name ?? "Загруженное изображение"}
              </span>
              <span className="mt-1 block text-sm leading-6 text-main-400">
                Нажмите или перетащите новый файл, чтобы заменить картинку.
              </span>
            </span>
          </span>
        ) : (
          <span className="flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-main-700/65 text-main-100">
              <Icon icon="mdi:image-plus-outline" width={26} height={26} />
            </span>
            <span className="mt-3 text-sm font-semibold text-main-100">
              Перетащите картинку сюда
            </span>
            <span className="mt-1 text-xs text-main-400">
              или нажмите для выбора файла
            </span>
          </span>
        )}
      </button>

      {previewUrl && (
        <button
          type="button"
          onClick={() => handleFile(null)}
          className="text-sm font-semibold text-red-300 transition hover:text-red-200"
        >
          Удалить изображение
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          handleFile(getFirstImageFile(event.target.files));
          event.target.value = "";
        }}
      />
    </div>
  );
};
