import React, { ReactNode } from 'react';
import { ScrollView as ScrollViewBase, ScrollViewProps, ViewStyle } from 'react-native';

interface CustomScrollViewProps extends ScrollViewProps {
  children: ReactNode;
}

export default function ScrollView({ children, contentContainerStyle, ...props }: CustomScrollViewProps) {
  const mergedContentContainerStyle: ViewStyle = {
    ...(contentContainerStyle as ViewStyle || {}),
    paddingBottom: 100
  };

  return (
    <ScrollViewBase
      {...props}
      contentContainerStyle={mergedContentContainerStyle}
    >
      {children}
    </ScrollViewBase>
  );
}