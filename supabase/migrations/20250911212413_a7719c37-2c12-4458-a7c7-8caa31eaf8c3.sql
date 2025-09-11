-- Add attachments column to chat_messages table to support file previews
ALTER TABLE public.chat_messages 
ADD COLUMN attachments JSONB DEFAULT NULL;