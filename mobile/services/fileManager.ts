/**
 * RARE 4N - File Manager Service
 * ??? File Categories, History, Search, Preview
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uri: string;
  category: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  preview?: string;
}

export interface FileCategory {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
}

export const FILE_CATEGORIES: FileCategory[] = [
  { id: 'all', name: 'All Files', nameAr: '???????? ??????????????', icon: 'folder', color: '#00eaff' },
  { id: 'code', name: 'Code', nameAr: '??????', icon: 'code', color: '#00ff41' },
  { id: 'image', name: 'Images', nameAr: '??????', icon: 'image', color: '#ff00ff' },
  { id: 'video', name: 'Videos', nameAr: '????????????????', icon: 'video', color: '#ff0040' },
  { id: 'document', name: 'Documents', nameAr: '??????????????', icon: 'document', color: '#00d4ff' },
  { id: 'audio', name: 'Audio', nameAr: '??????', icon: 'audio', color: '#a855f7' },
  { id: 'archive', name: 'Archives', nameAr: '??????????', icon: 'archive', color: '#ffd700' },
  { id: 'other', name: 'Other', nameAr: '????????', icon: 'file', color: '#666666' },
];

class FileManager {
  private files: Map<string, FileItem> = new Map();
  private readonly STORAGE_KEY = 'rare4n_files';

  /**
   * Initialize file manager
   */
  async init(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const filesArray = JSON.parse(stored);
        if (Array.isArray(filesArray)) {
          filesArray.forEach((file: FileItem) => {
            if (file && file.id && file.name) {
              this.files.set(file.id, file);
            }
          });
        }
      }
    } catch (error) {
      console.error('FileManager init error:', error);
      // Don't throw - allow app to continue with empty file manager
    }
  }

  /**
   * Save files to storage
   */
  private async save(): Promise<void> {
    try {
      const filesArray = Array.from(this.files.values());
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filesArray));
    } catch (error) {
      console.error('FileManager save error:', error);
    }
  }

  /**
   * Add file
   */
  async addFile(file: Omit<FileItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<FileItem> {
    // Validate input
    if (!file.name || !file.type || !file.uri) {
      throw new Error('File name, type, and URI are required');
    }

    const fileItem: FileItem = {
      ...file,
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.files.set(fileItem.id, fileItem);
    await this.save();
    return fileItem;
  }

  /**
   * Get file by ID
   */
  getFile(id: string): FileItem | undefined {
    if (!id) {
      return undefined;
    }
    return this.files.get(id);
  }

  /**
   * Get all files
   */
  getAllFiles(): FileItem[] {
    return Array.from(this.files.values());
  }

  /**
   * Get files by category
   */
  getFilesByCategory(categoryId: string): FileItem[] {
    if (categoryId === 'all') {
      return this.getAllFiles();
    }
    return this.getAllFiles().filter(file => file.category === categoryId);
  }

  /**
   * Get file history (sorted by date)
   */
  getFileHistory(limit?: number): FileItem[] {
    const files = this.getAllFiles();
    files.sort((a, b) => b.updatedAt - a.updatedAt);
    return limit ? files.slice(0, limit) : files;
  }

  /**
   * Search files
   */
  searchFiles(query: string): FileItem[] {
    if (!query || typeof query !== 'string') {
      return [];
    }
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) {
      return [];
    }
    return this.getAllFiles().filter(file =>
      file.name.toLowerCase().includes(lowerQuery) ||
      file.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Update file
   */
  async updateFile(id: string, updates: Partial<FileItem>): Promise<void> {
    if (!id) {
      throw new Error('File ID is required');
    }
    const file = this.files.get(id);
    if (!file) {
      throw new Error(`File with ID ${id} not found`);
    }
    const updated = { ...file, ...updates, updatedAt: Date.now() };
    this.files.set(id, updated);
    await this.save();
  }

  /**
   * Delete file
   */
  async deleteFile(id: string): Promise<void> {
    if (!id) {
      throw new Error('File ID is required');
    }
    if (!this.files.has(id)) {
      throw new Error(`File with ID ${id} not found`);
    }
    this.files.delete(id);
    await this.save();
  }

  /**
   * Get file preview URL
   */
  getFilePreview(file: FileItem): string | undefined {
    if (file.preview) {
      return file.preview;
    }

    // Generate preview based on file type
    if (file.type.startsWith('image/')) {
      return file.uri;
    }

    if (file.type.startsWith('video/')) {
      return file.uri;
    }

    return undefined;
  }

  /**
   * Get category by ID
   */
  getCategory(categoryId: string): FileCategory | undefined {
    return FILE_CATEGORIES.find(cat => cat.id === categoryId);
  }

  /**
   * Get all categories
   */
  getAllCategories(): FileCategory[] {
    return FILE_CATEGORIES;
  }
}

export const fileManager = new FileManager();


