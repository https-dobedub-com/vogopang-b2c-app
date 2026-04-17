import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { PlayerContentImage } from '../types/playerInfo';

type RemoteToonImageProps = {
  image: PlayerContentImage;
  index: number;
};

export function RemoteToonImage({ image, index }: RemoteToonImageProps) {
  const [aspectRatio, setAspectRatio] = useState(0.72);
  const imageUrl = image.url ?? image.src;

  useEffect(() => {
    if (!imageUrl) return;

    let isActive = true;
    Image.getSize(
      imageUrl,
      (width, height) => {
        if (isActive && width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      },
      () => {
        if (isActive) {
          setAspectRatio(0.72);
        }
      },
    );

    return () => {
      isActive = false;
    };
  }, [imageUrl]);

  if (!imageUrl) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>{index + 1}번째 이미지 URL이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.frame}>
      <Image source={{ uri: imageUrl }} style={[styles.image, { aspectRatio }]} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
  },
  fallback: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    padding: 16,
  },
  fallbackTitle: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
});
