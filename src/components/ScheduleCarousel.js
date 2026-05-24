import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Animated } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_MARGIN_H = 24; // Khoảng cách ngang giữa các card (bao gồm margin)
const CARD_WIDTH = width - CARD_MARGIN_H * 2; // Đảm bảo card có margin 24 ở cả hai bên khi hiển thị ở giữa
const CARD_GAP = 12; // Khoảng cách giữa các card (không bao gồm margin)
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

const ScheduleCarousel = ({ data = [], renderCard, accentColor = '#2563eb' }) => {
    const scrollX = useRef(new Animated.Value(0)).current;
    const [activeIndex, setActiveIndex] = useState(0);
    
    // Cập nhật activeIndex khi cuộn qua các item
    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index ?? 0);
        }
    }).current;

    // Cấu hình để xác định khi nào một item được xem là "đang xem"
    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    // Render mỗi item với hiệu ứng scale và opacity
    const renderItem = ({ item, index }) => {
        const inputRange = [
            (index - 1) * SNAP_INTERVAL,
            index * SNAP_INTERVAL,
            (index + 1) * SNAP_INTERVAL,
        ];

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.92, 1, 0.92],
            extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View
                style={{
                    width: CARD_WIDTH,
                    marginRight: CARD_GAP,
                    transform: [{ scale }],
                    opacity,
                }}
            >
                {renderCard(item)}
            </Animated.View>
        );
    };

  return (
    <View>
        <FlatList
            data={data}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={{ paddingRight: CARD_GAP }}

            // Animated: cập nhật scrollX khi cuộn
            onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
            )}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={renderItem}
        />

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
            {data.map((_, index) => {
                const dotWidth = scrollX.interpolate({
                    inputRange: [
                        (index - 1) * SNAP_INTERVAL,
                        index * SNAP_INTERVAL,
                        (index + 1) * SNAP_INTERVAL,
                    ],
                    outputRange: [8, 24, 8],
                    extrapolate: 'clamp',
                });

                const dotOpacity = scrollX.interpolate({
                    inputRange: [
                        (index - 1) * SNAP_INTERVAL,
                        index * SNAP_INTERVAL,
                        (index + 1) * SNAP_INTERVAL,
                    ],
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                });

                return (

                    <Animated.View
                        key={index}
                        style={[
                            styles.paginationDot,
                            {
                                width: dotWidth,
                                opacity: dotOpacity,
                                backgroundColor: accentColor,
                            },
                        ]}
                    />
                    
                );
            })}
        </View>

      {/* Counter */}
      <Text style={[styles.cardCounter, { color: accentColor }]}>
        {activeIndex + 1} / {data.length}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  cardCounter: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
});

export default ScheduleCarousel;
