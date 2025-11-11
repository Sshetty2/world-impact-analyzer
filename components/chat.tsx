/* eslint-disable max-statements */
'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState, useEffect, useCallback } from 'react';
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
import PantheonFilters from './pantheon-filters';
import ImpactGlobe, { PersonPin } from './impact-globe';
import { PantheonFilters as FilterType, PantheonPersonFiltered } from '@/app/api/pantheon/people/route';
import cx from 'classnames';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

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
  analysisResponse?: any;
}) {
  const [analysisData, setAnalysisData] = useState(analysisResponse);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedPersonForAnalysis, setSelectedPersonForAnalysis] = useState<PersonPin | null>(null);
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

  // Pantheon globe state
  const [globePeople, setGlobePeople] = useState<PersonPin[]>([]);
  const [globeLoading, setGlobeLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterType>({});

  // Helper function to assign colors based on domain
  const getDomainColor = useCallback((domain: string | null): string => {
    const colorMap: Record<string, string> = {
      INSTITUTIONS            : '#ef476f',
      ARTS                    : '#ffd166',
      HUMANITIES              : '#06d6a0',
      'SCIENCE AND TECHNOLOGY': '#118ab2',
      'PUBLIC FIGURE'         : '#8338ec',
      SPORTS                  : '#ff6b6b',
      'BUSINESS AND LAW'      : '#4ecdc4',
      EXPLORATION             : '#f77f00'
    };

    return domain ? colorMap[domain] || '#a1a1aa' : '#a1a1aa';
  }, []);

  // Helper function to format years (negative years become BC)
  const formatYear = useCallback((year: number | null | undefined): string => {
    if (year === null || year === undefined) return 'Unknown';
    if (year < 0) return `${Math.abs(year)} BC`;
    return year.toString();
  }, []);

  // Fetch globe data based on filters
  const fetchGlobeData = useCallback(
    async (filters: FilterType) => {
      setGlobeLoading(true);

      try {
        const params = new URLSearchParams();

        if (filters.continents && filters.continents.length > 0) {
          params.append('continents', filters.continents.join(','));
        }

        if (filters.domains && filters.domains.length > 0) {
          params.append('domains', filters.domains.join(','));
        }

        if (filters.eras && filters.eras.length > 0) {
          params.append('eras', filters.eras.join(','));
        }

        if (filters.countries && filters.countries.length > 0) {
          params.append('countries', filters.countries.join(','));
        }

        if (filters.occupations && filters.occupations.length > 0) {
          params.append('occupations', filters.occupations.join(','));
        }

        if (filters.genders && filters.genders.length > 0) {
          params.append('genders', filters.genders.join(','));
        }

        if (filters.hpiMin !== undefined) {
          params.append('hpiMin', filters.hpiMin.toString());
        }

        if (filters.hpiMax !== undefined) {
          params.append('hpiMax', filters.hpiMax.toString());
        }

        if (filters.aliveOnly) {
          params.append('aliveOnly', 'true');
        }
        params.append('limit', '5000');

        const response = await fetch(`/api/pantheon/people?${params.toString()}`);
        const data = await response.json();

        const transformedPeople: PersonPin[] = data.people
          .filter((p: PantheonPersonFiltered) => p.birthplaceLat && p.birthplaceLon)
          .map((p: PantheonPersonFiltered) => ({
            id               : p.id.toString(),
            name             : p.name,
            lat              : parseFloat(p.birthplaceLat!),
            lon              : parseFloat(p.birthplaceLon!),
            color            : getDomainColor(p.domain),
            birth            : formatYear(p.birthyear),
            death            : p.alive ? 'Present' : formatYear(p.deathyear),
            occupation       : p.occupation || undefined,
            era              : p.era || undefined,
            birthplace       : p.birthplaceName || undefined,
            birthplaceCountry: p.birthplaceCountry || undefined
          }));

        setGlobePeople(transformedPeople);
      } catch (error) {
        console.error('Error fetching globe data:', error);
      } finally {
        setGlobeLoading(false);
      }
    },
    [getDomainColor, formatYear]
  );

  // Initial fetch
  useEffect(() => {
    fetchGlobeData({});
  }, [fetchGlobeData]);

  // Debounced filter updates
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchGlobeData(currentFilters);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [currentFilters, fetchGlobeData]);

  const handleFiltersChange = useCallback((filters: FilterType) => {
    setCurrentFilters(filters);
  }, []);

  const handlePersonDoubleClick = useCallback((person: PersonPin) => {
    setSelectedPersonForAnalysis(person);
    setShowAnalysisModal(true);
  }, []);

  const handleConfirmAnalysis = useCallback(() => {
    if (selectedPersonForAnalysis) {
      setInput(selectedPersonForAnalysis.name);
      setShowAnalysisModal(false);
      // Trigger the analysis by setting input and marking as analyzing
      setIsAnalyzing(true);
      setSelectedPersonForAnalysis(null);
    }
  }, [selectedPersonForAnalysis, setInput]);

  return (
    <div className="h-screen overflow-hidden">
      <PanelGroup
        direction="horizontal"
        className="h-screen overflow-hidden"
      >
        <Panel
          defaultSize={analysisData ? 50 : 40}
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
          <div className="relative flex h-full min-w-0 flex-col bg-background">
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

            {/* Filters section - shown when no messages and no analysis */}
            {messages.length === 0 && !analysisData && (
              <div className="flex-1 overflow-hidden px-4 pb-4 pt-16">
                <PantheonFilters onFiltersChange={handleFiltersChange} />
              </div>
            )}

            <form
              className={cx(
                'mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:pb-6',
                isAnalyzing && 'max-w-2xl'
              )}
            >
              {!isReadonly && (
                <MultimodalInput
                  chatId={id}
                  input={input}
                  isAnalyzing={isAnalyzing}
                  setIsAnalyzing={setIsAnalyzing}
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
          defaultSize={analysisData ? 50 : 60}
          minSize={20}>
          {analysisData ? (
            <AnalysisPanel data={analysisData} />
          ) : (
            <div className="relative h-full w-full flex flex-col bg-background">
              {/* Stats overlay - positioned at top right */}
              <div className="absolute top-4 right-4 z-10 rounded-lg border border-zinc-800 bg-zinc-900/90 px-4 py-2.5 backdrop-blur-sm shadow-lg">
                <p className="text-sm text-zinc-300">
                  Showing <span className="font-semibold text-white">{globePeople.length.toLocaleString()}</span> historical figures
                </p>
              </div>

              {/* Globe */}
              <div className={cx(
                'flex-1 flex items-center justify-center transition-opacity duration-300',
                isAnalyzing && 'opacity-50 saturate-50'
              )}>
                <ImpactGlobe
                  people={globePeople}
                  autoRotateSpeed={isAnalyzing ? 1.5 : 0.5}
                  isAnalyzing={isAnalyzing || globeLoading}
                  onSelect={person => setInput(person.name)}
                  onDoubleClick={handlePersonDoubleClick}
                />
              </div>
            </div>
          )}
        </Panel>
      </PanelGroup>

      {/* Analysis Confirmation Modal */}
      <Dialog.Root open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-700/50 shadow-2xl w-[calc(100%-2rem)] max-w-lg z-50 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]">
            {/* Accent bar */}
            {selectedPersonForAnalysis && (
              <div
                className="h-1.5 w-full"
                style={{ background: selectedPersonForAnalysis.color || '#ffd166' }}
              />
            )}

            {/* Content */}
            <div className="p-8">
              {/* Close button */}
              <Dialog.Close asChild>
                <button
                  className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-800/50 p-1.5"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>

              {/* Title */}
              <Dialog.Title className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-6">
                Initiate Analysis
              </Dialog.Title>

              {/* Person Info Card */}
              {selectedPersonForAnalysis && (
                <div className="bg-zinc-800/40 rounded-xl p-6 mb-6 border border-zinc-700/30">
                  {/* Name */}
                  <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
                    {selectedPersonForAnalysis.name}
                  </h3>

                  {/* Metadata */}
                  <div className="space-y-2">
                    {selectedPersonForAnalysis.occupation && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="text-sm text-amber-400 font-medium capitalize">
                          {selectedPersonForAnalysis.occupation.toLowerCase()}
                        </span>
                      </div>
                    )}

                    {selectedPersonForAnalysis.era && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span className="text-sm text-blue-400 font-medium capitalize">
                          {selectedPersonForAnalysis.era.toLowerCase()}
                        </span>
                      </div>
                    )}

                    {selectedPersonForAnalysis.birth && selectedPersonForAnalysis.death && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                        <span className="text-sm text-zinc-400">
                          {selectedPersonForAnalysis.birth} - {selectedPersonForAnalysis.death}
                        </span>
                      </div>
                    )}

                    {(selectedPersonForAnalysis.birthplace || selectedPersonForAnalysis.birthplaceCountry) && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-sm text-emerald-400">
                          {selectedPersonForAnalysis.birthplace}
                          {selectedPersonForAnalysis.birthplace && selectedPersonForAnalysis.birthplaceCountry ? ', ' : ''}
                          {selectedPersonForAnalysis.birthplaceCountry}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <Dialog.Description className="text-sm text-zinc-400 leading-relaxed mb-8">
                This will perform a comprehensive analysis including impact scores, timeline of influence, major contributions, and historical context.
              </Dialog.Description>

              {/* Actions */}
              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <button className="flex-1 px-5 py-3 rounded-xl bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 transition-all text-sm font-semibold border border-zinc-700/50 hover:border-zinc-600">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleConfirmAnalysis}
                  className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 transition-all text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                >
                  Start Analysis
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
