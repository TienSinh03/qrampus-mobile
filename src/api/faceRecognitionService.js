import axios from 'axios';
import * as FileSystem from 'expo-file-system';

// Gradio Space API configuration
const GRADIO_CLIENT_URL = 'https://tienminhtran-my-face-recognition.hf.space';

/**
 * Call Gradio Space face recognition API
 * @param {string} image1Path - path to first image (file URI)
 * @param {string} image2Path - path to second image (file URI) 
 * @param {number} threshold - similarity threshold (default 0.5)
 * @returns {Promise<object>} - { verdict, cosine_similarity, threshold, is_same_person }
 */
export const callGradioFaceRecognition = async (image1Path, image2Path, threshold = 0.5) => {
  try {
    // Convert local file URIs to base64
    const image1Base64 = await FileSystem.readAsStringAsync(image1Path, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const image2Base64 = await FileSystem.readAsStringAsync(image2Path, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Prepare Gradio API request
    const payload = {
      data: [
        `data:image/jpeg;base64,${image1Base64}`,
        `data:image/jpeg;base64,${image2Base64}`,
        threshold,
        true, // block_mask
      ],
    };

    // Call Gradio API
    const response = await axios.post(
      `${GRADIO_CLIENT_URL}/api/predict/`,
      payload,
      {
        timeout: 60000, // 60 second timeout for face recognition
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data?.data?.[2]) {
      const result = response.data.data[2];
      return {
        verdict: result.verdict,
        cosine_similarity: result.cosine_similarity,
        threshold: result.threshold,
        is_same_person: result.is_same_person,
        ann1: response.data.data[0], // annotation image 1
        ann2: response.data.data[1], // annotation image 2
      };
    } else {
      throw new Error('Invalid response from Gradio API');
    }
  } catch (error) {
    console.error('Face recognition error:', error);
    throw new Error(
      error.message || 'Failed to call face recognition API'
    );
  }
};

/**
 * Compare current user's avatar with a captured photo
 * @param {string} avatarUrl - user's avatar URL
 * @param {string} capturedPhotoPath - path to captured photo
 * @param {number} threshold - similarity threshold
 * @returns {Promise<object>}
 */
export const compareWithAvatar = async (avatarUrl, capturedPhotoPath, threshold = 0.5) => {
  try {
    // Download avatar from URL to temp location
    const filename = `avatar_${Date.now()}.jpg`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    // Download avatar
    const downloadResult = await FileSystem.downloadAsync(avatarUrl, fileUri);

    if (downloadResult.status === 200) {
      // Call face recognition
      const result = await callGradioFaceRecognition(
        fileUri,
        capturedPhotoPath,
        threshold
      );

      // Clean up temp file
      await FileSystem.deleteAsync(fileUri);

      return result;
    } else {
      throw new Error('Failed to download avatar');
    }
  } catch (error) {
    console.error('Avatar comparison error:', error);
    throw error;
  }
};

/**
 * Compare two image URLs
 * @param {string} imageUrl1 - first image URL
 * @param {string} imageUrl2 - second image URL
 * @param {number} threshold - similarity threshold
 * @returns {Promise<object>}
 */
export const compareImageUrls = async (imageUrl1, imageUrl2, threshold = 0.5) => {
  try {
    const file1 = `${FileSystem.cacheDirectory}image1_${Date.now()}.jpg`;
    const file2 = `${FileSystem.cacheDirectory}image2_${Date.now()}.jpg`;

    // Download both images
    await Promise.all([
      FileSystem.downloadAsync(imageUrl1, file1),
      FileSystem.downloadAsync(imageUrl2, file2),
    ]);

    // Call face recognition
    const result = await callGradioFaceRecognition(file1, file2, threshold);

    // Clean up
    await Promise.all([
      FileSystem.deleteAsync(file1),
      FileSystem.deleteAsync(file2),
    ]);

    return result;
  } catch (error) {
    console.error('URL comparison error:', error);
    throw error;
  }
};
