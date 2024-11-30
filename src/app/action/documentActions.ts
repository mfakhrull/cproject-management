// src/app/actions/documentActions.ts
'use server';

import dbConnect from '@/lib/mongodb';
import EditorDocument from '@/models/EditorDocument';
import mongoose from 'mongoose';

export async function saveDocument(userId: string, formData: FormData) {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  try {
    const content = JSON.parse(formData.get('content') as string);
    const title = formData.get('title') as string;
    const projectId = formData.get('projectId') as string;
    const deadline = formData.get('deadline') as string;

    const newDocument = new EditorDocument({
      content,
      userId,
      projectId,
      title: title || 'Untitled Document',
      deadline: deadline ? new Date(deadline) : undefined,
    });

    await newDocument.save();
    return { success: true, documentId: newDocument._id };
  } catch (error) {
    console.error('Document save error:', error);
    return { success: false, error: 'Failed to save document' };
  }
}


export async function getUserDocuments(userId: string) {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  try {
    return await EditorDocument.find({ userId }).sort({ createdAt: -1 }).lean();
  } catch (error) {
    console.error('Fetch documents error:', error);
    return [];
  }
}

export async function getDocumentById(documentId: string, userId: string) {
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  try {
    const document = await EditorDocument.findOne({
      _id: new mongoose.Types.ObjectId(documentId),
      userId,
    }).lean();

    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  } catch (error) {
    console.error('Fetch document error:', error);
    throw new Error('Failed to fetch document');
  }
}
