import { createAsyncThunk } from '@reduxjs/toolkit';
import { instance } from '../../api/axiosInstance';

/**
 * Transform dữ liệu từ snake_case sang camelCase
 */
const transformAttendanceImage = (image) => {
  if (!image) return null;

  return {
    id: image.id,
    imageSessionId: image.image_session_id,
    fileUrl: image.file_url,
    thumbnailUrl: image.thumbnail_url,
    takenAt: image.taken_at,
    width: image.width,
    height: image.height,
    studentCountAi: image.student_count_ai,
    aiModel: image.ai_model,
    aiProcessedAt: image.ai_processed_at,
    metadata: image.metadata,
  };
};

/**
 * Lấy danh sách ảnh điểm danh theo image_session_id
 */
export const fetchAttendanceImagesBySessionId = createAsyncThunk(
  'attendanceImage/fetchBySessionId',
  async (imageSessionId, { rejectWithValue }) => {
    try {
      console.log('Fetching attendance images for session:', imageSessionId);

      const response = await instance.get(
        `/attendance-images/session/${imageSessionId}`
      );

      console.log('Fetched attendance images (raw):', response);

      // Transform data từ snake_case sang camelCase
      const transformedData =
        response.data.data?.map(transformAttendanceImage) || [];

      console.log('Transformed attendance images:', transformedData);

      return transformedData;
    } catch (error) {
      console.error('Error fetching attendance images:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải danh sách ảnh điểm danh'
      );
    }
  }
);

/**
 * Upload ảnh điểm danh
 */
export const uploadAttendanceImage = createAsyncThunk(
  'attendanceImage/upload',
  async ({ imageSessionId, imageUri }, { rejectWithValue }) => {
    try {
      console.log('[DEBUG] Uploading image for session:', imageSessionId);
      console.log('[DEBUG] Image URI:', imageUri);

      // Tạo FormData để upload file
      const formData = new FormData();
      formData.append('image_session_id', imageSessionId);
      
      // Lấy tên file từ URI
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      const match = /\.([\w]+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: type,
      });

      const response = await instance.post(
        '/attendance-images/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('[DEBUG] Upload response:', response.data);

      // Transform data
      const transformedImage = transformAttendanceImage(response.data.data);
      console.log('[DEBUG] Transformed uploaded image:', transformedImage);

      return transformedImage;
    } catch (error) {
      console.error('[ERROR] Upload failed:', error);
      console.error('[ERROR] Response:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Không thể upload ảnh'
      );
    }
  }
);

/**
 * Xóa ảnh điểm danh
 * Điều kiện: buổi học còn trong thời gian start_hour - end_hour
 */
export const deleteAttendanceImage = createAsyncThunk(
  'attendanceImage/delete',
  async (imageId, { rejectWithValue }) => {
    try {
      console.log('[DEBUG] Deleting attendance image:', imageId);

      const response = await instance.delete(
        `/attendance-images/${imageId}`
      );

      console.log('[DEBUG] Delete response:', response.data);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Không thể xóa ảnh');
      }

      return imageId; // Return ID để xóa từ state
    } catch (error) {
      console.error('[ERROR] Delete failed:', error);
      console.error('[ERROR] Response:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Không thể xóa ảnh. ' + error.message
      );
    }
  }
);
