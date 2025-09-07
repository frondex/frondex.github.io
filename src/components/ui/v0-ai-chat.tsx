"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
// import { VideoChatModal } from "@/components/VideoChatModal";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    Zap,
    Phone,
    ChevronDown,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // Temporarily shrink to get the right scrollHeight
            textarea.style.height = `${minHeight}px`;

            // Calculate new height
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        // Set initial height
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface VercelV0ChatProps {
    onSubmit?: (query: string, attachments?: File[]) => void;
}

const agents = [
    { id: 'general', name: 'General Agent', description: 'General AI assistant' },
    { id: 'mao', name: 'Mao', description: 'Mao Matchmaking agent' },
    { id: 'private-markets', name: 'Private Markets Intelligence', description: 'Private markets analysis' },
];

export function VercelV0Chat({ onSubmit }: VercelV0ChatProps) {
    const [value, setValue] = useState("");
    const [agentMode, setAgentMode] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(agents[0]);
    const [isVideoChatOpen, setIsVideoChatOpen] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isMobile = useIsMobile();
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: isMobile ? 50 : 60,
        maxHeight: isMobile ? 120 : 200,
    });

    const handleSubmit = () => {
        if (value.trim() || attachments.length > 0) {
            onSubmit?.(value.trim(), attachments);
            setValue("");
            setAttachments([]);
            adjustHeight(true);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setAttachments(prev => [...prev, ...files]);
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handlePaste = (event: React.ClipboardEvent) => {
        const items = Array.from(event.clipboardData.items);
        const imageFiles = items
            .filter(item => item.type.startsWith('image/'))
            .map(item => item.getAsFile())
            .filter(file => file !== null) as File[];
        
        if (imageFiles.length > 0) {
            setAttachments(prev => [...prev, ...imageFiles]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="w-full">
            <div className="relative bg-white rounded-xl border border-gray-200 shadow-lg">
                {/* Attachments Preview - Top Left */}
                {attachments.length > 0 && (
                    <div className={cn(
                        "absolute z-10 flex gap-1 sm:gap-2",
                        isMobile ? "top-2 left-2 flex-wrap max-w-[calc(100%-4rem)]" : "top-2 sm:top-3 left-2 sm:left-3"
                    )}>
                        {attachments.map((file, index) => (
                            <div key={index} className="relative group">
                                {file.type.startsWith('image/') ? (
                                    <div className="relative">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className={cn(
                                                "rounded-lg object-cover border border-gray-200 shadow-sm",
                                                isMobile ? "w-8 h-8" : "w-10 h-10 sm:w-12 sm:h-12"
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className={cn(
                                                "absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors flex items-center justify-center",
                                                isMobile ? "w-5 h-5 opacity-100" : "w-4 h-4 opacity-0 group-hover:opacity-100"
                                            )}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className={cn(
                                        "relative bg-gray-100 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center",
                                        isMobile ? "w-8 h-8" : "w-10 h-10 sm:w-12 sm:h-12"
                                    )}>
                                        <span className={cn(
                                            "text-gray-600 font-medium",
                                            isMobile ? "text-[10px]" : "text-xs"
                                        )}>
                                            {file.name.split('.').pop()?.toUpperCase()}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className={cn(
                                                "absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors flex items-center justify-center",
                                                isMobile ? "w-5 h-5 opacity-100" : "w-4 h-4 opacity-0 group-hover:opacity-100"
                                            )}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Controls - Mobile: Below textarea, Desktop: Top right */}
                {isMobile ? (
                    // Mobile: Controls at bottom for better reachability
                    <div className="flex justify-end gap-1 p-2 pt-0">
                        {agentMode ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm",
                                            "bg-orange-100 text-orange-800 border border-orange-300"
                                        )}
                                    >
                                        <Zap className="w-3 h-3 text-orange-700" />
                                        <span className="font-semibold">
                                            {selectedAgent.id !== 'general' 
                                                ? selectedAgent.name.toUpperCase() 
                                                : "AGENT"
                                            }
                                        </span>
                                        <span className="font-bold text-xs text-orange-800">ON</span>
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem onClick={() => setAgentMode(false)}>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Turn Off Agent Mode
                                    </DropdownMenuItem>
                                    {agents.map((agent) => (
                                        <DropdownMenuItem
                                            key={agent.id}
                                            onClick={() => setSelectedAgent(agent)}
                                            className={selectedAgent.id === agent.id ? "bg-orange-50" : ""}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{agent.name}</span>
                                                <span className="text-xs text-gray-500">{agent.description}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setAgentMode(true)}
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm bg-white text-gray-700 border border-gray-300"
                            >
                                <Zap className="w-3 h-3 text-gray-600" />
                                <span className="font-semibold">AGENT</span>
                                <span className="font-bold text-xs text-gray-600">OFF</span>
                            </button>
                        )}
                        
                        <button
                            type="button"
                            onClick={() => setIsVideoChatOpen(true)}
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 bg-green-100 text-green-800 border border-green-300 shadow-sm"
                        >
                            <Phone className="w-3 h-3 text-green-700" />
                            <span className="font-semibold">VIDEO</span>
                        </button>
                    </div>
                ) : (
                    // Desktop: Controls at top right
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20 flex items-center gap-1 sm:gap-2">
                        {agentMode ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className={cn(
                                            "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all duration-200 shadow-sm backdrop-blur-sm",
                                            "bg-orange-100/95 text-orange-800 border border-orange-300"
                                        )}
                                    >
                                        <Zap className="w-3 h-3 text-orange-700" />
                                        <span className="hidden md:inline font-semibold">
                                            {selectedAgent.id !== 'general' 
                                                ? `${selectedAgent.name.toUpperCase()} AGENT` 
                                                : "AGENT MODE"
                                            }
                                        </span>
                                        <span className="md:hidden font-semibold">
                                            {selectedAgent.id !== 'general' 
                                                ? selectedAgent.name.toUpperCase() 
                                                : "AGENT"
                                            }
                                        </span>
                                        <span className="font-bold text-xs text-orange-800">ON</span>
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem onClick={() => setAgentMode(false)}>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Turn Off Agent Mode
                                    </DropdownMenuItem>
                                    {agents.map((agent) => (
                                        <DropdownMenuItem
                                            key={agent.id}
                                            onClick={() => setSelectedAgent(agent)}
                                            className={selectedAgent.id === agent.id ? "bg-orange-50" : ""}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{agent.name}</span>
                                                <span className="text-xs text-gray-500">{agent.description}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setAgentMode(true)}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all duration-200 shadow-sm backdrop-blur-sm bg-white/95 text-gray-700 border border-gray-300 hover:bg-gray-50/95"
                            >
                                <Zap className="w-3 h-3 text-gray-600" />
                                <span className="hidden md:inline font-semibold">AGENT MODE</span>
                                <span className="md:hidden font-semibold">AGENT</span>
                                <span className="font-bold text-xs text-gray-600">OFF</span>
                            </button>
                        )}
                        
                        <button
                            type="button"
                            onClick={() => setIsVideoChatOpen(true)}
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all duration-200 bg-green-100/95 text-green-800 border border-green-300 hover:bg-green-200/95 shadow-sm backdrop-blur-sm"
                        >
                            <Phone className="w-3 h-3 text-green-700" />
                            <span className="hidden sm:inline font-semibold">VIDEO CHAT</span>
                            <span className="sm:hidden font-semibold">VIDEO</span>
                        </button>
                    </div>
                )}

                <div className="overflow-y-auto pt-1 sm:pt-2 relative">
                    {/* Conditional spacer for desktop text wrapping */}
                    {!isMobile && value.length > 50 && (
                        <div className="float-right w-[180px] sm:w-[220px] h-8 sm:h-10 clear-right"></div>
                    )}
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder="Ask anything"
                        className={cn(
                            "w-full resize-none bg-transparent border-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                            "text-gray-900 placeholder:text-gray-500",
                            isMobile 
                                ? "px-3 py-2 text-base placeholder:text-base min-h-[45px]" 
                                : "px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg placeholder:text-base sm:placeholder:text-lg min-h-[50px] sm:min-h-[60px]",
                            // Add top padding when attachments are present
                            attachments.length > 0 && (isMobile ? "pt-10" : "pt-12 sm:pt-14")
                        )}
                        style={{
                            overflow: "hidden",
                        }}
                    />
                </div>


                <div className={cn(
                    "flex items-center justify-between",
                    isMobile ? "p-2" : "p-2 sm:p-3"
                )}>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            type="button"
                            onClick={handleAttachClick}
                            className={cn(
                                "group hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1",
                                isMobile ? "p-2" : "p-1.5 sm:p-2"
                            )}
                        >
                            <Paperclip className={cn(
                                "text-gray-600",
                                isMobile ? "w-4 h-4" : "w-3 h-3 sm:w-4 sm:h-4"
                            )} />
                            {!isMobile && (
                                <span className="text-xs text-gray-500 hidden md:group-hover:inline transition-opacity">
                                    Attach
                                </span>
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx,.txt"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            type="button"
                            className={cn(
                                "px-2 py-1 rounded-lg text-gray-500 transition-colors border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-between gap-1",
                                isMobile ? "text-xs" : "text-xs sm:text-sm"
                            )}
                        >
                            <PlusIcon className={cn(
                                isMobile ? "w-3 h-3" : "w-3 h-3 sm:w-4 sm:h-4"
                            )} />
                            {!isMobile && <span className="hidden md:inline">Project</span>}
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!value.trim() && attachments.length === 0}
                            className={cn(
                                "rounded-lg text-sm transition-colors border border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-between gap-1",
                                isMobile ? "px-2 py-2" : "px-1.5 py-1.5",
                                (value.trim() || attachments.length > 0)
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-500"
                            )}
                        >
                            <ArrowUpIcon
                                className={cn(
                                    (value.trim() || attachments.length > 0)
                                        ? "text-white"
                                        : "text-gray-500",
                                    isMobile ? "w-4 h-4" : "w-3 h-3 sm:w-4 sm:h-4"
                                )}
                            />
                            <span className="sr-only">Send</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* <VideoChatModal 
                isOpen={isVideoChatOpen}
                onClose={() => setIsVideoChatOpen(false)}
            /> */}
        </div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
}

function ActionButton({ icon, label }: ActionButtonProps) {
    return (
        <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-full border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
        >
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );
}