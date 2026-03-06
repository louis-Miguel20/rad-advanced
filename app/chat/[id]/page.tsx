import { ChatInterface } from "@/components/chat/ChatInterface";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";

interface Source {
  documentTitle?: string;
  title?: string;
  content?: string;
  similarity?: number;
  score?: number;
  page?: number;
  url?: string;
}

export default async function ChatIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    redirect("/chat");
  }

  // Convert Prisma messages to Vercel AI SDK format
  const initialMessages = conversation.messages.map((msg) => ({
    id: msg.id,
    role: msg.role.toLowerCase() as "system" | "user" | "assistant" | "data",
    content: msg.content,
    annotations: msg.sources ? [{ sources: msg.sources as unknown as Source[] }] : [],
  }));

  return (
    <div className="flex h-full w-full">
      <div className="hidden md:flex w-[260px] h-full border-r border-border flex-shrink-0">
        <ConversationSidebar className="w-full h-full" currentId={id} />
      </div>
      <div className="flex-1 h-full overflow-hidden relative">
        <ChatInterface initialMessages={initialMessages} id={id} />
      </div>
    </div>
  );
}
