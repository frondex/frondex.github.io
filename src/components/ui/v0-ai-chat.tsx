"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

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

export function VercelV0Chat({ onSubmit }: VercelV0ChatProps) {
    const [value, setValue] = useState("");
    const [agentMode, setAgentMode] = useState(false);
    const [isVideoChatOpen, setIsVideoChatOpen] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
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
                {/* Top Controls */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 flex items-center gap-1 sm:gap-2">
                    {/* Agent Mode Toggle */}
                    <button
                        type="button"
                        onClick={() => setAgentMode(!agentMode)}
                        className={cn(
                            "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                            agentMode
                                ? "bg-orange-100 text-orange-700 border border-orange-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-150"
                        )}
                    >
                        <Zap className={cn("w-3 h-3", agentMode ? "text-orange-600" : "text-gray-500")} />
                        <span className="hidden md:inline">AGENT MODE</span>
                        <span className="md:hidden">AGENT</span>
                        <span className={cn("font-bold text-xs", agentMode ? "text-orange-700" : "text-gray-500")}>
                            {agentMode ? "ON" : "OFF"}
                        </span>
                    </button>
                    
                    {/* Video Chat Button */}
                    <button
                        type="button"
                        onClick={() => setIsVideoChatOpen(true)}
                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-all duration-200 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                    >
                        <Phone className="w-3 h-3 text-green-600" />
                        <span className="hidden sm:inline">VIDEO CHAT</span>
                        <span className="sm:hidden">VIDEO</span>
                    </button>
                </div>

                <div className="overflow-y-auto pt-1 sm:pt-2">
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
                            "w-full px-3 sm:px-4 py-2 sm:py-3",
                            "resize-none",
                            "bg-transparent",
                            "border-none",
                            "text-gray-900 text-base sm:text-lg",
                            "focus:outline-none",
                            "focus-visible:ring-0 focus-visible:ring-offset-0",
                            "placeholder:text-gray-500 placeholder:text-base sm:placeholder:text-lg",
                            "min-h-[50px] sm:min-h-[60px]"
                        )}
                        style={{
                            overflow: "hidden",
                        }}
                    />
                </div>

                {/* Attachments Preview */}
                {attachments.length > 0 && (
                    <div className="px-3 sm:px-4 pb-2 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2 mt-2">
                            {attachments.map((file, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm">
                                    <span className="text-gray-700 truncate max-w-[150px]">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(index)}
                                        className="text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between p-2 sm:p-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            type="button"
                            onClick={handleAttachClick}
                            className="group p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                        >
                            <Paperclip className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                            <span className="text-xs text-gray-500 hidden md:group-hover:inline transition-opacity">
                                Attach
                            </span>
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
                            className="px-2 py-1 rounded-lg text-xs sm:text-sm text-gray-500 transition-colors border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-between gap-1"
                        >
                            <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden md:inline">Project</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!value.trim() && attachments.length === 0}
                            className={cn(
                                "px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-between gap-1",
                                (value.trim() || attachments.length > 0)
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-500"
                            )}
                        >
                            <ArrowUpIcon
                                className={cn(
                                    "w-3 h-3 sm:w-4 sm:h-4",
                                    (value.trim() || attachments.length > 0)
                                        ? "text-white"
                                        : "text-gray-500"
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