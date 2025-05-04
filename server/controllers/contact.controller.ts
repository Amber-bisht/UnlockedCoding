import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertContactSchema } from '@shared/schema';
import { z } from 'zod';

export const createContactSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validData = insertContactSchema.parse(req.body);
    
    // Create the contact submission
    const submission = await storage.createContactSubmission(validData);
    
    res.status(201).json(submission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    
    console.error('Error creating contact submission:', error);
    res.status(500).json({ message: 'Failed to create contact submission' });
  }
};

export const getContactSubmissions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const submissions = await storage.getContactSubmissions();
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error getting contact submissions:', error);
    res.status(500).json({ message: 'Failed to retrieve contact submissions' });
  }
};

export const getContactSubmissionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissionId = parseInt(req.params.id);
    
    if (isNaN(submissionId)) {
      res.status(400).json({ message: 'Invalid submission ID' });
      return;
    }
    
    const submission = await storage.getContactSubmissionById(submissionId);
    
    if (!submission) {
      res.status(404).json({ message: 'Contact submission not found' });
      return;
    }
    
    res.status(200).json(submission);
  } catch (error) {
    console.error('Error getting contact submission:', error);
    res.status(500).json({ message: 'Failed to retrieve contact submission' });
  }
};

export const markContactSubmissionAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissionId = parseInt(req.params.id);
    
    if (isNaN(submissionId)) {
      res.status(400).json({ message: 'Invalid submission ID' });
      return;
    }
    
    const submission = await storage.getContactSubmissionById(submissionId);
    
    if (!submission) {
      res.status(404).json({ message: 'Contact submission not found' });
      return;
    }
    
    await storage.markContactSubmissionAsRead(submissionId);
    
    res.status(200).json({ message: 'Contact submission marked as read' });
  } catch (error) {
    console.error('Error marking contact submission as read:', error);
    res.status(500).json({ message: 'Failed to mark contact submission as read' });
  }
};

export const deleteContactSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissionId = parseInt(req.params.id);
    
    if (isNaN(submissionId)) {
      res.status(400).json({ message: 'Invalid submission ID' });
      return;
    }
    
    const submission = await storage.getContactSubmissionById(submissionId);
    
    if (!submission) {
      res.status(404).json({ message: 'Contact submission not found' });
      return;
    }
    
    await storage.deleteContactSubmission(submissionId);
    
    res.status(200).json({ message: 'Contact submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    res.status(500).json({ message: 'Failed to delete contact submission' });
  }
};