/**
 * RARE 4N - Icon Component
 * Renders SVG icons from assets/icons
 */

import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

// Icon map - Simplified for RARE 4N
const icons: Record<string, React.FC<any>> = {
  apps: (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" fill={props.fill} />
    </Svg>
  ),
  chat: (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill={props.fill} />
    </Svg>
  ),
  settings: (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill={props.fill} />
    </Svg>
  ),
  'voice-chat': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill={props.fill} />
    </Svg>
  ),
  folder: (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" fill={props.fill} />
    </Svg>
  ),
  archive: (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z" fill={props.fill} />
    </Svg>
  ),
  emergency: (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill={props.fill} />
    </Svg>
  ),
  task: (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill={props.fill} />
    </Svg>
  ),
  'record-voice': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" fill={props.fill} />
    </Svg>
  ),
  'arrow-back': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={props.fill} />
    </Svg>
  ),
  'send': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill={props.fill} />
    </Svg>
  ),
  'download': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill={props.fill} />
    </Svg>
  ),
  'eye': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill={props.fill} />
    </Svg>
  ),
  'scan': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 13h1.5v1.5H13V18zm1.5 1.5H16V21h-1.5v-1.5zm1.5-3H19V19h-1.5v-1.5zm0 3H19V21h-1.5v-1.5zm-3-3h1.5v1.5H13V18zm3 0h1.5v1.5H16V18zm-3 3h1.5V21H13v-1.5zm3 0h1.5V21H16v-1.5z" fill={props.fill} />
    </Svg>
  ),
  'trash': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill={props.fill} />
    </Svg>
  ),
  'copy': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill={props.fill} />
    </Svg>
  ),
  'image': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill={props.fill} />
    </Svg>
  ),
  'file': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill={props.fill} />
    </Svg>
  ),
  'phone': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill={props.fill} />
    </Svg>
  ),
  'email': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill={props.fill} />
    </Svg>
  ),
  'shield': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill={props.fill} />
    </Svg>
  ),
  'secure': (props: any) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill={props.fill} />
    </Svg>
  ),
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function Icon({ name, size = 24, color = '#00eaff', style }: IconProps) {
  const IconComponent = icons[name];

  if (!IconComponent) {
    return <View style={[{ width: size, height: size }, style]} />;
  }

  return (
    <View style={style}>
      <IconComponent width={size} height={size} fill={color} />
    </View>
  );
}

export const iconNames = Object.keys(icons);


