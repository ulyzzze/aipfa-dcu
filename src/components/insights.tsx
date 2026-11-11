"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpIcon, ChartNoAxesCombinedIcon, PlusIcon, SparklesIcon, WalletIcon, TrendingDownIcon, SquareIcon } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { getDemoReply } from "@/lib/demo-chat";
import { monthLabel } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Message, MessageContent, MessageHeader } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { MessageScrollerProvider, MessageScroller, MessageScrollerViewport, MessageScrollerContent, MessageScrollerItem, MessageScrollerButton } from "@/components/ui/message-scroller";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };
const suggestions = [
  { icon: ChartNoAxesCombinedIcon, label: "Understand my spending", question: "Summarise my spending this month" },
  { icon: WalletIcon, label: "Check my budgets", question: "How are my budgets doing?" },
  { icon: TrendingDownIcon, label: "Find ways to save", question: "Where could I save money?" },
];

export const InsightsScreen = () => {
  const { state, month } = useDemo();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setIsThinking(false);
  };
  const newChat = () => { stop(); setMessages([]); setDraft(""); input.current?.focus(); };
  const send = (value: string) => {
    const question = value.trim();
    if (!question || timer.current || isThinking || !state.profile.insights) return;
    const previousQuestion = [...messages].reverse().find((message) => message.role === "user")?.content;
    const reply = getDemoReply(question, state, month, previousQuestion);
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", content: question }]);
    setDraft("");
    setIsThinking(true);
    timer.current = setTimeout(() => {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
      setIsThinking(false);
      timer.current = null;
    }, 650);
    input.current?.focus();
  };
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); send(draft); };

  if (!state.profile.insights) return <Empty><EmptyHeader><EmptyTitle>Demo insights are turned off</EmptyTitle><EmptyDescription>You can enable them again in your workspace preferences.</EmptyDescription></EmptyHeader><Button render={<Link href="/settings" />} nativeButton={false}>Open settings</Button></Empty>;

  return (
    <section data-slot="insights-chat" data-testid="insights-chat" aria-label="Finance assistant" className="mx-auto flex h-[calc(100dvh-23rem)] min-h-[420px] w-full max-w-3xl flex-col sm:min-h-[520px]">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><SparklesIcon aria-hidden className="size-4" /><span>AIPFA assistant</span><Badge variant="outline">Simulated AI</Badge></div>
        <Button variant="ghost" size="sm" onClick={newChat} disabled={!messages.length && !draft}><PlusIcon data-icon="inline-start" />New chat</Button>
      </div>
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-7 pb-10 pt-6 text-center">
          <div className="assistant-mark flex size-14 items-center justify-center rounded-2xl"><SparklesIcon aria-hidden className="size-6" /></div>
          <div className="flex flex-col gap-3"><h2 className="text-3xl font-medium tracking-tight sm:text-4xl">Make sense of your money.</h2><p className="text-sm text-muted-foreground">A little clarity for your everyday finances.<br />Ask me about your spending, budgets or savings.</p></div>
          <div className="flex w-full flex-wrap justify-center gap-2">{suggestions.map(({ icon: Icon, label, question }) => <Button key={label} variant="outline" size="sm" onClick={() => send(question)}><Icon data-icon="inline-start" />{label}</Button>)}</div>
        </div>
      ) : (
        <MessageScrollerProvider autoScroll>
          <MessageScroller className="flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="gap-8 px-1 pb-8 pt-4" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions">
                {messages.map((message) => <MessageScrollerItem key={message.id} messageId={message.id} scrollAnchor={message.role === "user"}>
                  <Message align={message.role === "user" ? "end" : "start"}><MessageContent>
                    <MessageHeader>{message.role === "user" ? "You" : "AIPFA assistant"}</MessageHeader>
                    <Bubble variant={message.role === "user" ? "muted" : "ghost"} align={message.role === "user" ? "end" : "start"}><BubbleContent className="whitespace-pre-wrap">{message.content}</BubbleContent></Bubble>
                  </MessageContent></Message>
                </MessageScrollerItem>)}
                {isThinking && <MessageScrollerItem messageId="thinking"><Message><MessageContent><MessageHeader>AIPFA assistant</MessageHeader><p role="status" className="text-sm text-muted-foreground">Looking through your demo records…</p></MessageContent></Message></MessageScrollerItem>}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton aria-label="Jump to latest message" />
          </MessageScroller>
        </MessageScrollerProvider>
      )}
      <div className="shrink-0 pb-1 pt-4">
        <form onSubmit={submit} data-testid="chat-composer">
          <FieldGroup><Field className="gap-0"><FieldLabel htmlFor="assistant-question" className="sr-only">Message the finance assistant</FieldLabel>
            <InputGroup className="assistant-composer items-end rounded-2xl p-2">
              <InputGroupTextarea ref={input} id="assistant-question" placeholder="Ask anything about your finances…" value={draft} maxLength={2000} rows={1} className="max-h-36 min-h-12 py-3" aria-describedby="chat-disclaimer" onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(draft); }
              }} />
              <InputGroupAddon align="inline-end" className="self-end pb-2">
                {isThinking ? <InputGroupButton size="icon-sm" variant="default" aria-label="Stop response" onClick={stop}><SquareIcon /></InputGroupButton> : <InputGroupButton type="submit" size="icon-sm" variant="default" className="rounded-full" aria-label="Send message" disabled={!draft.trim()}><ArrowUpIcon /></InputGroupButton>}
              </InputGroupAddon>
            </InputGroup>
          </Field></FieldGroup>
        </form>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-muted-foreground" id="chat-disclaimer"><span>{monthLabel(month)} · Fictional data</span><span>Local simulation · No data leaves your browser</span></div>
        <p className="mt-1 text-center text-xs text-muted-foreground">General spending information, not financial advice.</p>
      </div>
    </section>
  );
};
