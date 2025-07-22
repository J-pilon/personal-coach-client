import React, { ReactNode } from "react";
import { LinearGradient as BaseLinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors'

interface LinearGradientProps {
  children: ReactNode
}


export default function LinearGradient({ children }: LinearGradientProps) {
  const gradient = Colors.gradient

  return (
    <BaseLinearGradient
      colors={gradient.primary}
      locations={gradient.primaryLocations}
      start={gradient.start}
      end={gradient.end}
      style={{ flex: 1 }}
    >
      {children}
    </BaseLinearGradient>
  )
} 