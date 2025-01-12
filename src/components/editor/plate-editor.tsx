'use client';

import React, { useState } from 'react';
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner'; 

import { Plate } from '@udecode/plate-common/react';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { SettingsDialog } from '@/components/editor/settings';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';

export function PlateEditor() {
  const { userId } = useAuth();
  const editor = useCreateEditor();
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('Untitled Document');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('OPEN'); // New state for status
  const searchParams = useSearchParams();
  const projectId = searchParams ? searchParams.get("projectId") : null;
  const projectName = searchParams ? searchParams.get("projectName") : null;

  const handleSave = async () => {
    if (!userId || !projectId) {
      toast.error('User must be logged in, and project ID must be provided to save documents');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/documents/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          content: JSON.stringify(editor.children),
          title,
          projectId,
          deadline,
          status, // Pass the status to the backend
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Document saved successfully!', {
          description: `Document ID: ${result.documentId}`,
        });
      } else {
        toast.error('Failed to save document', {
          description: result.message || 'Unknown error',
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
        <div className="p-4 space-y-4">
          {projectName && (
            <div className="mb-4">
              <h2 className="text-xl font-bold">Project: {projectName}</h2>
              <p>Project ID: {projectId}</p>
            </div>
          )}
          <EditorContainer>
            <div className="flex items-center justify-end mb-2 space-x-2">
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
                className="flex-grow px-2 py-2 border rounded"
              />
              <input 
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="px-2 py-2 border rounded"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-2 py-2 border rounded bg-white"
              >
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
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
        </div>
      </Plate>
    </DndProvider>
  );
}
