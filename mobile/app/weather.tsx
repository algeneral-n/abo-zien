/**
 * RARE 4N - Weather Screen
 * ???????? ??????????
 * ??? Cognitive Loop ??? Kernel ??? Weather Engine
 */

import { useState, useEffect } from 'react';
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

export default function Weather() {
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { theme, colors } = useTheme();
  const kernel = RAREKernel.getInstance();

  useEffect(() => {
    getCurrentLocation();
    
    // ??? ???????????????? ???????????? CognitiveLoop ??? Agent ??? Response
    const unsubscribeLocation = kernel.on('agent:maps:response', (event) => {
      if (event.data.success && event.data.location) {
        setLatitude(event.data.location.latitude);
        setLongitude(event.data.location.longitude);
        setLocation(event.data.location.name || '???????????? ????????????');
        loadWeather(event.data.location.latitude, event.data.location.longitude);
      }
    });
    
    const unsubscribeWeather = kernel.on('agent:weather:response', (event) => {
      if (event.data.current) {
        setCurrentWeather(event.data.current);
      }
      if (event.data.forecast) {
        setForecast(event.data.forecast);
      }
      setIsLoading(false);
    });
    
    const unsubscribeSearch = kernel.on('agent:maps:search:response', (event) => {
      if (event.data.success && event.data.results && event.data.results.length > 0) {
        const firstResult = event.data.results[0];
        setLatitude(firstResult.location.latitude);
        setLongitude(firstResult.location.longitude);
        loadWeather(firstResult.location.latitude, firstResult.location.longitude);
      } else {
        setError('???? ?????? ???????????? ?????? ????????????');
        setIsLoading(false);
      }
    });
    
    return () => {
      unsubscribeLocation();
      unsubscribeWeather();
      unsubscribeSearch();
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      // ??? ?????????? ?????? Kernel ??? CognitiveLoop (???? fetch ??????????)
      kernel.emit({
        type: 'user:input',
        data: {
          text: 'get current location',
          type: 'maps',
        },
        source: 'ui',
      });
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const loadWeather = async (lat: number, lon: number) => {
    try {
      setIsLoading(true);
      setError('');

      // ??? ?????????? ?????? Kernel ??? CognitiveLoop (???? fetch ??????????)
      kernel.emit({
        type: 'user:input',
        data: {
          text: `get weather for ${lat}, ${lon}`,
          type: 'weather',
          latitude: lat,
          longitude: lon,
        },
        source: 'ui',
      });
    } catch (error: any) {
      setError('?????? ?????? ???? ??????????????');
      console.error('Weather error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('???????? ?????????? ????????????');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // ??? ?????????? ?????? Kernel ??? CognitiveLoop (???? fetch ??????????)
      kernel.emit({
        type: 'user:input',
        data: {
          text: `search location ${location}`,
          type: 'maps',
          query: location,
        },
        source: 'ui',
      });
    } catch (error: any) {
      setError('?????? ?????? ???? ??????????????');
      console.error('Search error:', error);
    } finally {
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
        <Text style={[styles.headerTitle, { color: colors.primary }]}>??????????</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { borderColor: colors.primary, color: colors.text }]}
            placeholder="???????? ???? ????????"
            plREMOVED={colors.primary + '50'}
            value={location}
            onChangeText={setLocation}
            onSubmitEditing={handleSearch}
          />
          <Pressable
            style={[styles.searchButton, { bREMOVED: colors.primary }]}
            onPress={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <REMOVED color="#000" />
            ) : (
              <Icon name="apps" size={20} color="#000" />
            )}
          </Pressable>
        </View>

        {error && (
          <View style={[styles.errorContainer, { borderColor: '#ff4444' }]}>
            <Text style={[styles.errorText, { color: '#ff4444' }]}>{error}</Text>
          </View>
        )}

        {currentWeather && (
          <View style={[styles.weatherContainer, { borderColor: colors.primary }]}>
            <Text style={[styles.weatherTitle, { color: colors.primary }]}>?????????? ????????????</Text>
            <View style={styles.weatherMain}>
              <Text style={[styles.temperature, { color: colors.text }]}>
                {currentWeather.temperature}??C
              </Text>
              <Text style={[styles.condition, { color: colors.textSecondary }]}>
                {currentWeather.condition || '????????'}
              </Text>
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>??????????????</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {currentWeather.humidity}%
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>????????????</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {currentWeather.windSpeed} km/h
                </Text>
              </View>
              {currentWeather.feelsLike && (
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>????????</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {currentWeather.feelsLike}??C
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {forecast && forecast.forecast && forecast.forecast.length > 0 && (
          <View style={[styles.forecastContainer, { borderColor: colors.primary }]}>
            <Text style={[styles.forecastTitle, { color: colors.primary }]}>???????????? ????????????????</Text>
            {forecast.forecast.slice(0, 7).map((day: any, index: number) => (
              <View key={index} style={styles.forecastItem}>
                <Text style={[styles.forecastDay, { color: colors.text }]}>
                  {new Date(day.date || day.time).toLocaleDateString('ar-SA', { weekday: 'long' })}
                </Text>
                <View style={styles.forecastTemp}>
                  <Text style={[styles.forecastHigh, { color: colors.text }]}>
                    {day.high || day.temperature}??C
                  </Text>
                  {day.low && (
                    <Text style={[styles.forecastLow, { color: colors.textSecondary }]}>
                      {day.low}??C
                    </Text>
                  )}
                </View>
                <Text style={[styles.forecastCondition, { color: colors.textSecondary }]}>
                  {day.condition || '????????'}
                </Text>
              </View>
            ))}
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
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 14,
    textAlign: 'right',
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  weatherContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    bREMOVED: 'rgba(255,255,255,0.03)',
    marginBottom: 20,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'right',
  },
  weatherMain: {
    alignItems: 'center',
    marginBottom: 20,
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  condition: {
    fontSize: 16,
    marginTop: 8,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  forecastContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    bREMOVED: 'rgba(255,255,255,0.03)',
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'right',
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  forecastDay: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  forecastTemp: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  forecastHigh: {
    fontSize: 16,
    fontWeight: '600',
  },
  forecastLow: {
    fontSize: 14,
  },
  forecastCondition: {
    fontSize: 12,
    marginLeft: 12,
  },
});



