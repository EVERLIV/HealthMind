import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import Webcam from "@uppy/webcam";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/webcam/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
  asButton?: boolean; // If false, renders as div instead of Button
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  allowedFileTypes = ['*/*'],
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
  asButton = true,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes,
      },
      autoProceed: false,
    })
      .use(Webcam, {
        countdown: false,
        modes: ['photo'],
        mirror: false,
        facingMode: 'environment', // Use back camera by default
        showViewfinder: true,
        showRecordingLength: false,
        preferredVideoMimeType: 'video/mp4',
        videoConstraints: {
          facingMode: 'environment',
          width: { min: 720, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        },
        locale: {
          strings: {
            smile: 'Наведите на анализ',
            takePicture: 'Сделать фото',
            startRecording: 'Начать запись',
            stopRecording: 'Остановить запись',
            allowAccessTitle: 'Разрешите доступ к камере',
            allowAccessDescription: 'Для съемки анализа крови нужен доступ к камере',
            noCameraTitle: 'Камера недоступна',
            noCameraDescription: 'Для фотографирования анализа необходима камера',
            recordingStoppedMaxSize: 'Запись остановлена: превышен максимальный размер файла',
            submitRecordedFile: 'Использовать фото',
          },
        },
      })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        onComplete?.(result);
      })
      .on("error", (error) => {
        console.error("Uppy upload error:", error);
      })
      .on("upload-error", (file, error) => {
        console.error("Upload error for file:", file?.name, error);
      })
  );

  return (
    <div>
      {asButton ? (
        <Button onClick={() => setShowModal(true)} className={buttonClassName}>
          {children}
        </Button>
      ) : (
        <div 
          onClick={() => setShowModal(true)} 
          className={buttonClassName}
          style={{ cursor: 'pointer' }}
        >
          {children}
        </div>
      )}

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
        plugins={['Camera']}
        note="Сфотографируйте анализ крови или выберите файл с устройства"
        fileManagerSelectionType="files"
        showProgressDetails={true}
        hideRetryButton={false}
        hideUploadButton={false}
        hideCancelButton={false}
        hidePauseResumeButton={false}
        showSelectedFiles={true}
        showRemoveButtonAfterComplete={false}
        disableStatusBar={false}
        disableInformer={false}
        width="100%"
        height={350}
        locale={{
          strings: {
            // Core strings
            dropHereOr: 'Перетащите файл сюда или %{browse}',
            browse: 'выберите',
            browseFiles: 'выберите файл',
            uploadComplete: 'Загрузка завершена',
            uploadPaused: 'Загрузка приостановлена',
            resumeUpload: 'Продолжить загрузку',
            pauseUpload: 'Приостановить загрузку',
            retryUpload: 'Повторить загрузку',
            cancelUpload: 'Отменить загрузку',
            xFilesSelected: {
              0: '%{smart_count} файл выбран',
              1: '%{smart_count} файла выбрано',
              2: '%{smart_count} файлов выбрано'
            },
            uploadingXFiles: {
              0: 'Загружается %{smart_count} файл',
              1: 'Загружается %{smart_count} файла',
              2: 'Загружается %{smart_count} файлов'
            },
            processingXFiles: {
              0: 'Обрабатывается %{smart_count} файл',
              1: 'Обрабатывается %{smart_count} файла',
              2: 'Обрабатывается %{smart_count} файлов'
            },
            uploading: 'Загрузка',
            complete: 'Завершено',
            uploadFailed: 'Ошибка загрузки',
            paused: 'Приостановлено',
            retry: 'Повторить',
            cancel: 'Отменить',
            done: 'Готово',
            removeFile: 'Удалить файл',
            editFile: 'Редактировать файл',
            editing: 'Редактирование %{file}',
            finishEditingFile: 'Завершить редактирование',
            save: 'Сохранить',
            
            // Camera strings
            smile: 'Наведите камеру на анализ',
            takePicture: 'Сделать фото',
            startRecording: 'Начать запись',
            stopRecording: 'Остановить запись',
            allowAccessTitle: 'Разрешите доступ к камере',
            allowAccessDescription: 'Для фотографирования анализа крови нужен доступ к камере',
            noCameraTitle: 'Камера недоступна',
            noCameraDescription: 'Для фотографирования анализа необходима камера',
            recordingStoppedMaxSize: 'Запись остановлена: превышен максимальный размер файла',
            submitRecordedFile: 'Использовать фото',
            
            // Additional interface strings
            dropFiles: 'Перетащите файл анализа',
            addMore: 'Добавить еще',
            importFrom: 'Импорт из:',
            myDevice: 'Мое устройство',
            camera: 'Камера',
            addMoreFiles: 'Добавить файлы',
            addingMoreFiles: 'Добавление файлов',
            dashboardWindowTitle: 'Загрузка анализа крови',
            dashboardTitle: 'Загрузка анализа',
            pluginNameCamera: 'Камера',
            back: 'Назад',
            close: 'Закрыть',
            save: 'Сохранить',
            edit: 'Редактировать',
            cancel: 'Отменить',
            proceed: 'Продолжить',
            upload: 'Загрузить',
            
            // File validation
            youCanOnlyUploadX: {
              0: 'Можно загрузить только %{fileTypes}',
              1: 'Можно загрузить только %{fileTypes}',
              2: 'Можно загрузить только %{fileTypes}'
            },
            exceedsSize: 'Файл превышает максимальный размер %{size}',
            youCanOnlyUploadFileTypes: 'Можно загружать только: %{types}',
            companionError: 'Ошибка подключения'
          }
        }}
      />
    </div>
  );
}
