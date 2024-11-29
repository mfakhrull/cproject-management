'use client';

import React, { useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner'; 

import { Plate } from '@udecode/plate-common/react';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { SettingsDialog } from '@/components/editor/settings';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';

import { saveDocument } from '@/app/action/documentActions';

export function PlateEditor() {
  const { userId } = useAuth();
  const editor = useCreateEditor();
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('Untitled Document');

  const handleSave = async () => {
    if (!userId) {
      toast.error('User must be logged in to save documents');
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append('content', JSON.stringify(editor.children));
    formData.append('title', title);

    try {
      const result = await saveDocument(userId, formData);
      if (result.success) {
        toast.success('Document saved successfully!', {
          description: `Document ID: ${result.documentId}`,
        });
      } else {
        toast.error('Failed to save document', {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error('An error occurred while saving', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor}>
        <EditorContainer>
          <div className="flex items-center justify-end mb-2 space-x-2">
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              className="flex-grow px-2 py-2 border rounded"
            />
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Document'}
            </button>
          </div>
          <Editor variant="demo" />
        </EditorContainer>
        <SettingsDialog />
      </Plate>
    </DndProvider>
  );
}