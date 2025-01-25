'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import { Block } from './block';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { VisibilityType } from './visibility-selector';
import { useBlockSelector } from '@/hooks/use-block';

export function Chat ({
  id,
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
  isReadonly
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
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
    <>
      <PanelGroup
        direction="horizontal"
        className="h-dvh">
        {/* Left side - Chat container */}
        <Panel
          defaultSize={50}
          minSize={20}>
          <div className="flex h-full min-w-0 flex-col bg-background">
            <ChatHeader
              chatId={id}
              selectedModelId={selectedModelId}
              selectedVisibilityType={selectedVisibilityType}
              isReadonly={isReadonly}
            />

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

            <form className="mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:pb-6">
              {!isReadonly && (
                <MultimodalInput
                  chatId={id}
                  input={input}
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

        <PanelResizeHandle className="w-1 bg-border transition-colors hover:bg-accent" />

        {/* Right side - Block component */}
        <Panel
          defaultSize={50}
          minSize={20}>
          <div className="h-full overflow-y-auto bg-background">
            <Block
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              append={append}
              messages={messages}
              setMessages={setMessages}
              reload={reload}
              votes={votes}
              isReadonly={isReadonly}
            />
          </div>
        </Panel>
      </PanelGroup>
    </>
  );
}
