import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

export interface LoadingSkeletonProps {
  /** The type of skeleton to display */
  type?: 'text' | 'card' | 'list' | 'avatar' | 'button';
  /** The number of skeleton items to show */
  count?: number;
  /** The height of the skeleton */
  height?: number;
  /** The width of the skeleton (percentage or fixed) */
  width?: string | number;
  /** Whether to show rounded corners */
  rounded?: boolean;
  /** Custom test ID for testing */
  testID?: string;
}

export default function LoadingSkeleton({
  type = 'text',
  count = 1,
  height = 20,
  width = '100%',
  rounded = true,
  testID = 'loading-skeleton'
}: LoadingSkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      })
    );

    shimmerAnimation.start();

    return () => {
      shimmerAnimation.stop();
    };
  }, [shimmerAnim]);

  const getSkeletonStyle = (): ViewStyle => {
    return {
      height,
      width: width as ViewStyle['width'],
      backgroundColor: '#2B42B6',
      opacity: 0.3,
      ...(rounded && { borderRadius: height / 2 }),
    };
  };

  const renderSkeletonItem = (index: number) => {
    const shimmerOpacity = shimmerAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 0.6, 0.3],
    });

    return (
      <Animated.View
        key={index}
        className="mb-3"
        style={[
          getSkeletonStyle(),
          {
            opacity: shimmerOpacity,
          },
        ]}
        testID={`${testID}-item-${index}`}
      />
    );
  };

  const renderTextSkeleton = () => (
    <View className="w-full" testID={testID}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="mb-3">
          {renderSkeletonItem(index)}
          {index < count - 1 && (
            <View
              className="mt-2"
              style={{
                height: height * 0.7,
                width: '80%',
                backgroundColor: '#2B42B6',
                opacity: 0.2,
                borderRadius: rounded ? height * 0.35 : 0,
              }}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderCardSkeleton = () => (
    <View className="w-full" testID={testID}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="mb-4 bg-[#2B42B6]/10 rounded-2xl p-4 border border-[#33CFFF]/20"
          testID={`${testID}-card-${index}`}
        >
          {/* Card header */}
          <View className="flex-row items-center mb-3">
            <View
              className="mr-3"
              style={{
                height: 40,
                width: 40,
                backgroundColor: '#2B42B6',
                opacity: 0.3,
                borderRadius: 20,
              }}
            />
            <View className="flex-1">
              {renderSkeletonItem(index)}
              <View
                className="mt-2"
                style={{
                  height: height * 0.6,
                  width: '60%',
                  backgroundColor: '#2B42B6',
                  opacity: 0.2,
                  borderRadius: rounded ? height * 0.3 : 0,
                }}
              />
            </View>
          </View>
          {/* Card content */}
          {renderSkeletonItem(index + 1)}
          <View
            className="mt-2"
            style={{
              height: height * 0.8,
              width: '90%',
              backgroundColor: '#2B42B6',
              opacity: 0.2,
              borderRadius: rounded ? height * 0.4 : 0,
            }}
          />
        </View>
      ))}
    </View>
  );

  const renderListSkeleton = () => (
    <View className="w-full" testID={testID}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="flex-row items-center py-3 border-b border-[#33CFFF]/10"
          testID={`${testID}-list-item-${index}`}
        >
          <View
            className="mr-3"
            style={{
              height: 16,
              width: 16,
              backgroundColor: '#2B42B6',
              opacity: 0.3,
              borderRadius: 8,
            }}
          />
          <View className="flex-1">
            {renderSkeletonItem(index)}
            <View
              className="mt-1"
              style={{
                height: height * 0.6,
                width: '70%',
                backgroundColor: '#2B42B6',
                opacity: 0.2,
                borderRadius: rounded ? height * 0.3 : 0,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderAvatarSkeleton = () => (
    <View className="w-full" testID={testID}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="items-center mb-4"
          testID={`${testID}-avatar-${index}`}
        >
          <View
            className="mb-2"
            style={{
              height: height * 2,
              width: height * 2,
              backgroundColor: '#2B42B6',
              opacity: 0.3,
              borderRadius: height,
            }}
          />
          {renderSkeletonItem(index)}
        </View>
      ))}
    </View>
  );

  const renderButtonSkeleton = () => (
    <View className="w-full" testID={testID}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="mb-3"
          style={{
            height: 48,
            width: '100%',
            backgroundColor: '#2B42B6',
            opacity: 0.3,
            borderRadius: 12,
          }}
          testID={`${testID}-button-${index}`}
        />
      ))}
    </View>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return renderTextSkeleton();
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'avatar':
        return renderAvatarSkeleton();
      case 'button':
        return renderButtonSkeleton();
      default:
        return renderTextSkeleton();
    }
  };

  return renderSkeleton();
}
