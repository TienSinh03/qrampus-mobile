import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';

const useCollapsibleHeader = ( expandedHeight,
  {
    collapseThreshold = 5,
    expandThreshold = 3,
    minScrollY = 30,
    duration = 180,
  } = {}
) => {
  const lastScrollY = useRef(0);
  const headerAnim = useRef(new Animated.Value(1)).current;
  const headerVisible = useRef(true);

  const animatedHeight = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, expandedHeight],
  });

  const animatedOpacity = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const animatedTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-expandedHeight * 0.15, 0],
  });

  const handleScroll = useCallback((event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;
    lastScrollY.current = currentY;

    if (diff > collapseThreshold && currentY > minScrollY && headerVisible.current) {
      headerVisible.current = false;
      Animated.timing(headerAnim, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }).start();
    } else if (diff < -expandThreshold && !headerVisible.current) {
      headerVisible.current = true;
      Animated.timing(headerAnim, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      }).start();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xử lý fling mạnh — onScroll không đủ nhạy cho momentum scroll
  const handleMomentumScrollBegin = useCallback((event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    if (currentY > lastScrollY.current && currentY > minScrollY && headerVisible.current) {
      headerVisible.current = false;
      Animated.timing(headerAnim, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }).start();
    } else if (currentY < lastScrollY.current && !headerVisible.current) {
      headerVisible.current = true;
      Animated.timing(headerAnim, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      }).start();
    }
    lastScrollY.current = currentY;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    animatedHeight,
    animatedOpacity,
    animatedTranslateY,
    handleScroll,
    handleMomentumScrollBegin,
  };
};

export default useCollapsibleHeader;
