'use client';

import React from 'react';
import { Plate } from '@udecode/plate-common/react';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';

export function PlateReader({ initialContent }: { initialContent: any[] }) {
  // Pass the initial content directly to the editor hook
  const editor = useCreateEditor(initialContent);

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor variant="demo" readOnly />
      </EditorContainer>
    </Plate>
  );
}
