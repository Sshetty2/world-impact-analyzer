'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { VisibilityType } from './visibility-selector';
import { useBlockSelector } from '@/hooks/use-block';
import { AnalysisPanel } from './analysis/analysis-panel';
import cx from 'classnames';

export function Chat ({
  id,
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  analysisResponse
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  analysisResponse: any;
}) {
  const [analysisData, setAnalysisData] = useState(analysisResponse);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const { mutate } = useSWRConfig();

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload
  } = useChat({
    id,
    body: {
      id,
      modelId: selectedModelId
    },
    initialMessages,
    experimental_throttle: 100,
    onFinish             : () => {
      mutate('/api/history');
    }
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isBlockVisible = useBlockSelector(state => state.isVisible);

  return (
    <div className="h-screen overflow-hidden">
      <PanelGroup
        direction="horizontal"
        className="h-screen overflow-hidden"
      >
        <Panel
          defaultSize={50}
          minSize={20}
        >
          <div className="absolute inset-x-0 top-0 z-10">
            <ChatHeader
              chatId={id}
              selectedModelId={selectedModelId}
              selectedVisibilityType={selectedVisibilityType}
              isReadonly={isReadonly}
            />
          </div>
          <div className={cx(
            'relative flex h-full min-w-0 flex-col bg-background',
            messages.length === 0 && 'justify-center -mt-32'
          )}>

            {messages.length > 0 && (
              <Messages
                chatId={id}
                isLoading={isLoading}
                votes={votes}
                messages={messages}
                setMessages={setMessages}
                reload={reload}
                isReadonly={isReadonly}
                isBlockVisible={isBlockVisible}
              />
            )}
            <form className={cx(
              'mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:pb-6',
              isAnalyzing && 'max-w-2xl'
            )}>
              {!isReadonly && (
                <MultimodalInput
                  chatId={id}
                  input={input}
                  setAnalysisData={data => {
                    setAnalysisData(data);
                    setIsAnalyzing(false);
                  }}
                  setInput={setInput}
                  handleSubmit={handleSubmit}
                  isLoading={isLoading}
                  stop={stop}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  messages={messages}
                  setMessages={setMessages}
                  append={append}
                />
              )}
            </form>
          </div>
        </Panel>
        <PanelResizeHandle className="z-20 w-1 bg-border transition-colors hover:bg-accent" />
        <Panel
          defaultSize={50}
          minSize={20}>
          <AnalysisPanel data={analysisData} />
        </Panel>
      </PanelGroup>
    </div>
  );
}
