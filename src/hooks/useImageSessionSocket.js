import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from './useSocket';
import {
  setImageSessionStatus,
  addImageSession,
  updateImageSessionStatus,
} from '../features/imageSession/ImageSessionSlice';

/**
 * Hook xử lý real-time image session updates qua socket
 * 
 * @param {string} courseSectionId - Course section ID
 * @param {string} classSessionId - Class session ID (để check status)
 * @returns {Object} { isSocketReady, lastUpdate }
 * 
 * @example
 * const { isSocketReady, lastUpdate } = useImageSessionSocket(courseSectionId, classSessionId);
 */
export function useImageSessionSocket(courseSectionId, classSessionId) {
  const dispatch = useDispatch();
  const { socket } = useSocket(); // Destructure socket from returned object
  
  // Listener cho image session created event
  const handleImageSessionCreated = useCallback((session) => {
    console.log('[Socket] imageSession:created received:', session);
    
    // 1. Update sessionStatus nếu matching class session
    if (session.classSessionId === classSessionId) {
      dispatch(setImageSessionStatus(session));
    }
    
    // 2. Add to sessions list
    dispatch(addImageSession(session));
  }, [classSessionId, dispatch]);

  // Listener cho image session status check
  const handleImageSessionStatusCheck = useCallback((status) => {
    console.log('[Socket] imageSession:statusCheck received:', status);
    dispatch(setImageSessionStatus(status));
  }, [dispatch]);

  // Listener cho image session ended
  const handleImageSessionEnded = useCallback((session) => {
    console.log('[Socket] imageSession:ended received:', session);
    // Update status to ENDED
    dispatch(setImageSessionStatus({
      ...session,
      status: 'ENDED',
    }));
  }, [dispatch]);

  // Setup socket listeners
  useEffect(() => {
    if (!socket || !courseSectionId) {
      console.log('[Socket] Skipping setup - socket:', !!socket, 'courseSectionId:', !!courseSectionId);
      return;
    }

    try {
      // Join room cho course section (để nhận broadcast)
      socket.emit('notification:join-course', { courseSectionId });

      // Listen events
      socket.on('imageSession:created', handleImageSessionCreated);
      socket.on('imageSession:statusCheck', handleImageSessionStatusCheck);
      socket.on('imageSession:ended', handleImageSessionEnded);

      console.log('[Socket] Image session listeners registered for', courseSectionId);
    } catch (error) {
      console.error('[Socket] Error setting up listeners:', error);
    }

    // Cleanup
    return () => {
      if (!socket) return;
      
      try {
        socket.off('imageSession:created', handleImageSessionCreated);
        socket.off('imageSession:statusCheck', handleImageSessionStatusCheck);
        socket.off('imageSession:ended', handleImageSessionEnded);
        
        // Leave room khi unmount
        socket.emit('notification:leave-course', { courseSectionId });
      } catch (error) {
        console.error('[Socket] Error cleaning up listeners:', error);
      }
    };
  }, [socket, courseSectionId, handleImageSessionCreated, handleImageSessionStatusCheck, handleImageSessionEnded]);

  return {
    isSocketReady: !!socket,
    lastUpdate: new Date(),
  };
}

export default useImageSessionSocket;
