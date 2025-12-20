import Constants from 'expo-constants';
export const RARE_CONFIG = {
    apiUrl: 'https://your-domain.com',
    geminiKey: Constants.expoConfig.extra.GEMINI_API_KEY,
    elevenLabsKey: Constants.expoConfig.extra.ELEVEN_LABS_KEY,
    supabaseUrl: Constants.expoConfig.extra.SUPABASE_URL,
    supabaseKey: Constants.expoConfig.extra.SUPABASE_ANON_KEY,
    kernelMode: 'COGNITIVE_LOOP_ACTIVE'
};
export default RARE_CONFIG;
