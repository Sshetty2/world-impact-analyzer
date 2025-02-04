/* eslint-disable max-statements */
'use client';

import type {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message
} from 'ai';
import cx from 'classnames';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { sanitizeUIMessages } from '@/lib/utils';

import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SuggestedActions } from './suggested-actions';
import equal from 'fast-deep-equal';
import { AnalysisInstructions } from './analysis-instructions';

function PureMultimodalInput ({
  chatId,
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  setAnalysisData,
  className
}: {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  className?: string;
  setAnalysisData?: Dispatch<SetStateAction<any>>;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    ''
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;

      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }

    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/chat/${chatId}`);

    handleSubmit(undefined, { experimental_attachments: attachments });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [chatId, handleSubmit, attachments, setAttachments, setLocalStorageInput, width]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body  : formData
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map(file => file.name));

      try {
        const uploadPromises = files.map(file => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          attachment => attachment !== undefined
        );

        setAttachments(currentAttachments => [
          ...currentAttachments,
          ...successfullyUploadedAttachments
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments]
  );

  const handleNameSubmit = useCallback(async () => {
    if (!input.trim()) {
      toast.error('Please enter a name');

      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ personName: input })
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Analysis failed');

        return;
      }

      const analysisResponse = await response.json();

      if (analysisResponse.status === 'existing' || analysisResponse.status === 'new') {
        setAnalysisData?.(analysisResponse.result);
        setIsAnalyzed(true);

        if (analysisResponse.result) {
          window.history.replaceState({}, '', `/chat/${chatId}`);

          handleSubmit(undefined, {
            experimental_attachments: attachments,
            body                    : { analysisResponse: analysisResponse.result }
          });

          setAttachments([]);
          setLocalStorageInput('');
          resetHeight();

          if (width && width > 768) {
            textareaRef.current?.focus();
          }
        }
      }
    } catch (error) {
      toast.error('Failed to process request');
      console.error('Error in handleNameSubmit:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [attachments, chatId, handleSubmit, input, setAnalysisData, setAttachments, setLocalStorageInput, width]);

  if (messages.length === 0) {
    return (
      <div className="relative flex w-full flex-col gap-6">
        <div className="relative flex w-full flex-col gap-4">
          <Textarea
            ref={textareaRef}
            placeholder="Enter a person's name to analyze..."
            value={input}
            onChange={handleInput}
            className={cx(
              'resize-none rounded-2xl !text-base bg-muted dark:border-zinc-700',
              'min-h-[40px] py-2 pb-2',
              className
            )}
            rows={1}
            autoFocus
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleNameSubmit();
              }
            }}
          />
          <div className="absolute right-0 top-[5px] flex w-fit flex-row justify-end pr-2">
            <Button
              className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
              onClick={event => {
                event.preventDefault();
                handleNameSubmit();
              }}
              disabled={input.length === 0 || isAnalyzing}
            >
              {isAnalyzing ? (
                <div className="flex items-center">
                  <div className="size-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
                </div>
              ) : (
                <ArrowUpIcon size={14} />
              )}
            </Button>
          </div>
        </div>
        <AnalysisInstructions />
      </div>
    );
  }

  // After analysis, show the regular chat input
  return (
    <div className="relative mb-5 flex w-full flex-col gap-4">
      {/* {messages.length === 0
        && attachments.length === 0
        && uploadQueue.length === 0 && (
        <SuggestedActions
          append={append}
          chatId={chatId} />
      )} */}

      <input
        type="file"
        className="pointer-events-none fixed -left-4 -top-4 size-0.5 opacity-0"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row items-end gap-2 overflow-x-scroll">
          {attachments.map(attachment => (
            <PreviewAttachment
              key={attachment.url}
              attachment={attachment} />
          ))}

          {uploadQueue.map(filename => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url        : '',
                name       : filename,
                contentType: ''
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <Textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className={cx(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-1xl !text-base bg-muted pb-10 dark:border-zinc-700',
          className
        )}
        rows={2}
        autoFocus
        onKeyDown={event => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();

            if (isLoading) {
              toast.error('Please wait for the model to finish its response!');
            } else {
              submitForm();
            }
          }
        }}
      />

      <div className="absolute bottom-0 flex w-fit flex-row justify-start p-2">
        <AttachmentsButton
          fileInputRef={fileInputRef}
          isLoading={isLoading} />
      </div>

      <div className="absolute bottom-0 right-0 flex w-fit flex-row justify-end p-2">
        {isLoading ? (
          <StopButton
            stop={stop}
            setMessages={setMessages} />
        ) : (
          <SendButton
            input={input}
            submitForm={submitForm}
            uploadQueue={uploadQueue}
          />
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) {
      return false;
    }

    if (prevProps.isLoading !== nextProps.isLoading) {
      return false;
    }

    if (!equal(prevProps.attachments, nextProps.attachments)) {
      return false;
    }

    return true;
  }
);

function PureAttachmentsButton ({
  fileInputRef,
  isLoading
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  isLoading: boolean;
}) {
  return (
    <Button
      className="h-fit rounded-md rounded-bl-lg p-[7px] hover:bg-zinc-200 dark:border-zinc-700 hover:dark:bg-zinc-900"
      onClick={event => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={isLoading}
      variant="ghost"
    >
      <PaperclipIcon size={14} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton ({
  stop,
  setMessages
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  return (
    <Button
      className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
      onClick={event => {
        event.preventDefault();
        stop();
        setMessages(messages => sanitizeUIMessages(messages));
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton ({
  submitForm,
  input,
  uploadQueue
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
      onClick={event => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length) {
    return false;
  }

  if (prevProps.input !== nextProps.input) {
    return false;
  }

  return true;
});
