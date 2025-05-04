import { Request, Response } from 'express';
import { Category } from '../models';
import { logger } from '../utils/logger';

// Get all categories
export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    logger.error(`Get all categories error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// Get category by slug
export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });
    
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    
    res.status(200).json(category);
  } catch (error) {
    logger.error(`Get category by slug error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching category' });
  }
};

// Create new category (admin only)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return;
    }
    
    const { name, description, imageUrl } = req.body;
    
    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    // Check if category with slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      res.status(400).json({ message: 'Category with this name already exists' });
      return;
    }
    
    // Create new category
    const category = new Category({
      name,
      slug,
      description,
      imageUrl
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    logger.error(`Create category error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error creating category' });
  }
};

// Update category (admin only)
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return;
    }
    
    const { id } = req.params;
    const { name, description, imageUrl } = req.body;
    
    // Find category
    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    
    // Update fields
    if (name && name !== category.name) {
      // Create new slug if name changes
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      
      // Check if new slug already exists
      const existingCategory = await Category.findOne({ slug, _id: { $ne: id } });
      if (existingCategory) {
        res.status(400).json({ message: 'Category with this name already exists' });
        return;
      }
      
      category.name = name;
      category.slug = slug;
    }
    
    if (description) category.description = description;
    if (imageUrl) category.imageUrl = imageUrl;
    
    await category.save();
    res.status(200).json(category);
  } catch (error) {
    logger.error(`Update category error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error updating category' });
  }
};

// Delete category (admin only)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
      return;
    }
    
    const { id } = req.params;
    
    // Delete category
    const result = await Category.findByIdAndDelete(id);
    if (!result) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error(`Delete category error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error deleting category' });
  }
};