// Rajasthani Layout - All colors, design and styles for VideoUpload
// Beautiful and vibrant design inspired by Rajasthani colors

import { StyleSheet } from 'react-native';

export const videoUploadStyles = StyleSheet.create({
  // Main container with dark background
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Upload area with Rajasthani inspired colors
  uploadArea: {
    padding: 8,
  },
  
  // Upload button with app's main purple color
  uploadButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#8B00FF', // App main purple border
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    shadowColor: '#35ffa4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  
  uploadButtonSubtext: {
    fontSize: 12,
    color: '#8B00FF', // App main purple
    marginTop: 4,
  },
  
  // Selected file container
  selectedFileContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B00FF',
  },
  
  selectedFileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  
  selectedFileSize: {
    fontSize: 12,
    color: '#8B00FF', // App main purple
  },
  
  // Form section
  formSection: {
    padding: 16,
  },
  
  // Main upload button with app's main purple color
  uploadButtonMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B00FF', // App main purple
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 8,
    shadowColor: '#8B00FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  
  uploadButtonDisabled: {
    backgroundColor: '#333333',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  uploadButtonMainText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// App color palette for consistency
export const appColors = {
  mainPurple: '#8B00FF',
  brightYellow: '#FFD700',
  richRed: '#DC143C',
  royalBlue: '#4169E1',
  darkBackground: '#000000',
  lightGray: '#1A1A1A',
  textWhite: '#FFFFFF',
  textGray: '#CCCCCC',
  borderPurple: '#8B00FF',
};
