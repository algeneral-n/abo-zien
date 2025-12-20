/**
 * RARE 4N - Names Tunnel Background
 * ?????????? ?????????????? - Names Tunnel
 * ???????? ?????? ???????? ???????????? ???? ???????? ??????????????
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const NAMES = ['NADER', 'OMY', 'NARIMAN', 'NADA', 'ZIEN', 'TAMARA', 'OMAR', 'KAYAN'];
const GRID_SIZE = 8;

export default function NamesTunnel() {
  const animations = useRef<Animated.Value[][]>(
    Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => new Animated.Value(0))
    )
  ).current;

  useEffect(() => {
    animations.forEach((row, rowIndex) => {
      row.forEach((anim, colIndex) => {
        const delay = (rowIndex + colIndex) * 50;
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    });
  }, []);

  const { width, height } = Dimensions.get('window');
  const cellSize = width / GRID_SIZE;

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      {Array(GRID_SIZE).fill(null).map((_, rowIndex) =>
        Array(GRID_SIZE).fill(null).map((_, colIndex) => {
          const nameIndex = (rowIndex * GRID_SIZE + colIndex) % NAMES.length;
          const name = NAMES[nameIndex];
          const anim = animations[rowIndex][colIndex];

          const scale = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1.2],
          });

          const opacity = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7],
          });

          const translateZ = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -20],
          });

          return (
            <Animated.View
              key={`${rowIndex}-${colIndex}`}
              style={[
                styles.cell,
                {
                  left: colIndex * cellSize,
                  top: rowIndex * cellSize,
                  width: cellSize,
                  height: cellSize,
                  transform: [
                    { scale },
                    { translateZ },
                  ],
                  opacity,
                },
              ]}
            >
              <Text style={styles.nameText}>{name}</Text>
            </Animated.View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
  },
  cell: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(0, 234, 255, 0.4)',
    textAlign: 'center',
  },
});


