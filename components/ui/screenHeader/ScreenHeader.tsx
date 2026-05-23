import { Colors } from "@/constants/Colors";
import React, { ReactNode } from "react";
import { StyleProp, Text, View, ViewStyle } from "react-native";
import { getSubtitleByTitle } from "./getSubtitleByTitle";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  backButton: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const ScreenHeader = ({ title, subtitle, backButton, style }: ScreenHeaderProps) => {
  const derivedSubtitle = subtitle ?? getSubtitleByTitle(title);

  return (
    <View className="relative items-center pt-4 pb-2 w-full" style={style}>
      <View className="absolute left-0 top-4 z-10">{backButton}</View>

      <View className="items-center px-14">
        <Text
          className="text-[28px] font-semibold text-center"
          style={{ color: Colors.text.primary }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {derivedSubtitle ? (
          <Text
            className="mt-1 text-sm text-center"
            style={{ color: Colors.text.secondary }}
            numberOfLines={2}
          >
            {derivedSubtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default ScreenHeader;