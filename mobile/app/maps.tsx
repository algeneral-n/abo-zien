/**
 * RARE 4N - Maps Screen
 * ???????? ?????????????? ????????????????
 * ??? Cognitive Loop ??? Kernel ??? Maps Engine
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  REMOVED,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import Icon from '../components/Icon';
import { API_URL } from '../services/config';

export default function Maps() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [route, setRoute] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { theme, colors } = useTheme();
  const kernel = RAREKernel.getInstance();

  useEffect(() => {
    // ??? ???????????????? ???????????? CognitiveLoop ??? Agent ??? Response
    const unsubscribeRoute = kernel.on('agent:maps:response', (event) => {
      if (event.data.route) {
        setRoute(event.data.route);
      }
      setIsLoading(false);
    });
    
    const unsubscribeError = kernel.on('agent:maps:error', (event) => {
      setError(event.data.error || '?????? ???????????? ?????? ????????????');
      setIsLoading(false);
    });
    
    return () => {
      unsubscribeRoute();
      unsubscribeError();
    };
  }, []);

  const handleGetRoute = async () => {
    if (!from || !to) {
      setError('???????? ?????????? ???????? ?????????????? ????????????????');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // ??? ?????????? ?????? Kernel ??? CognitiveLoop ??? Maps Agent
      kernel.emit({
        type: 'user:input',
        data: {
          text: `get route from ${from} to ${to}`,
          type: 'maps',
          action: 'get_route',
          parameters: {
            from,
            to,
            provider: 'google',
            includeWeather: true,
          },
        },
        source: 'ui',
      });
    } catch (error: any) {
      setError('?????? ?????? ???? ??????????????');
      console.error('Route error:', error);
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={theme.background as [string, string, ...string[]]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={20} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>?????????????? ????????????????</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
            placeholder="????"
            plREMOVED={colors.primary + '50'}
            value={from}
            onChangeText={setFrom}
          />
          <TextInput
            style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
            placeholder="??????"
            plREMOVED={colors.primary + '50'}
            value={to}
            onChangeText={setTo}
          />
          <Pressable
            style={[styles.searchButton, { bREMOVED: colors.primary }]}
            onPress={handleGetRoute}
            disabled={isLoading}
          >
            {isLoading ? (
              <REMOVED color="#000" />
            ) : (
              <Text style={styles.searchButtonText}>??????</Text>
            )}
          </Pressable>
        </View>

        {error && (
          <View style={[styles.errorContainer, { borderColor: '#ff4444' }]}>
            <Text style={[styles.errorText, { color: '#ff4444' }]}>{error}</Text>
          </View>
        )}

        {route && (
          <View style={[styles.routeContainer, { borderColor: colors.primary }]}>
            <Text style={[styles.routeTitle, { color: colors.primary }]}>????????????</Text>
            <Text style={[styles.routeText, { color: colors.text }]}>
              {route.summary || '???????? ????????'}
            </Text>
            {route.distance && (
              <Text style={[styles.routeText, { color: colors.textSecondary }]}>
                ??????????????: {route.distance}
              </Text>
            )}
            {route.duration && (
              <Text style={[styles.routeText, { color: colors.textSecondary }]}>
                ??????????: {route.duration}
              </Text>
            )}
            {route.weather && (
              <View style={styles.weatherInfo}>
                <Text style={[styles.weatherText, { color: colors.primary }]}>
                  ?????????? ???? ????????????: {route.weather.temperature}??C
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  inputContainer: {
    gap: 12,
    marginBottom: 20,
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 14,
    textAlign: 'right',
  },
  searchButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'right',
  },
  routeContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    bREMOVED: 'rgba(255,255,255,0.03)',
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'right',
  },
  routeText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'right',
  },
  weatherInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  weatherText: {
    fontSize: 14,
    textAlign: 'right',
  },
});



