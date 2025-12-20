/**
 * RARE 4N - App Builder Screen
 * ???????? ???????? ?????????????????? - Terminal + Libraries + File Upload + Client Portal Integration
 * ??? Cognitive Loop ??? Kernel ??? Builder Agent
 */

import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import { useKernelAgent } from '../hooks/useKernelAgent';
import Icon from '../components/Icon';
import { API_URL } from '../services/config';
import { TerminalIntegrationService } from '../core/services/TerminalIntegrationService';

const { width } = Dimensions.get('window');

// Command Groups - ?????????????? ?????????? ?????????? ????????????
const COMMAND_GROUPS = {
  client: {
    name: 'Client Portal',
    nameAr: '?????????? ????????????',
    icon: 'people',
    commands: [
      { id: 'client-link', label: 'Generate Link', labelAr: '?????????? ????????', command: 'generate-client-link' },
      { id: 'client-widget', label: 'Generate Widget', labelAr: '?????????? Widget', command: 'generate-client-widget' },
      { id: 'client-register', label: 'Register Client', labelAr: '?????????? ????????', command: 'register-client' },
      { id: 'client-notify', label: 'Send Notification', labelAr: '?????????? ??????????', command: 'send-client-notification' },
      { id: 'client-payment', label: 'Create Payment', labelAr: '?????????? ??????', command: 'create-payment-session' },
      { id: 'client-preview', label: 'Generate Preview', labelAr: '?????????? ????????????', command: 'generate-preview-link' },
    ],
  },
  ios: {
    name: 'iOS',
    nameAr: '???? ???? ????',
    icon: 'phone-iphone',
    commands: [
      { id: 'ios-init', label: 'Init iOS Project', labelAr: '?????????? ?????????? iOS', command: 'npx react-native init' },
      { id: 'ios-pod', label: 'Install Pods', labelAr: '?????????? Pods', command: 'cd ios && pod install' },
      { id: 'ios-build', label: 'Build iOS', labelAr: '???????? iOS', command: 'xcodebuild -workspace' },
      { id: 'ios-run', label: 'Run iOS', labelAr: '?????????? iOS', command: 'npx react-native run-ios' },
      { id: 'ios-test', label: 'Test iOS', labelAr: '???????????? iOS', command: 'npm test -- --platform=ios' },
      { id: 'ios-clean', label: 'Clean Build', labelAr: '?????????? ????????????', command: 'cd ios && xcodebuild clean' },
    ],
  },
  android: {
    name: 'Android',
    nameAr: '??????????????',
    icon: 'phone-android',
    commands: [
      { id: 'android-init', label: 'Init Android', labelAr: '?????????? ?????????? Android', command: 'npx react-native init' },
      { id: 'android-gradle', label: 'Gradle Build', labelAr: '???????? Gradle', command: './gradlew build' },
      { id: 'android-run', label: 'Run Android', labelAr: '?????????? Android', command: 'npx react-native run-android' },
      { id: 'android-test', label: 'Test Android', labelAr: '???????????? Android', command: 'npm test -- --platform=android' },
      { id: 'android-clean', label: 'Clean Build', labelAr: '?????????? ????????????', command: './gradlew clean' },
      { id: 'android-assemble', label: 'Assemble APK', labelAr: '?????????? APK', command: './gradlew assembleRelease' },
    ],
  },
  expo: {
    name: 'Expo',
    nameAr: '??????????',
    icon: 'rocket-launch',
    commands: [
      { id: 'expo-init', label: 'Expo Init', labelAr: '?????????? Expo', command: 'npx create-expo-app' },
      { id: 'expo-start', label: 'Expo Start', labelAr: '?????????? Expo', command: 'npx expo start' },
      { id: 'expo-build', label: 'EAS Build', labelAr: '???????? EAS', command: 'eas build --platform all' },
      { id: 'expo-build-ios', label: 'EAS Build iOS', labelAr: '???????? iOS', command: 'eas build --platform ios' },
      { id: 'expo-build-android', label: 'EAS Build Android', labelAr: '???????? Android', command: 'eas build --platform android' },
      { id: 'expo-submit', label: 'EAS Submit', labelAr: '?????? EAS', command: 'eas submit' },
      { id: 'expo-update', label: 'EAS Update', labelAr: '?????????? EAS', command: 'eas update' },
    ],
  },
  npm: {
    name: 'NPM',
    nameAr: '???? ???? ????',
    icon: 'package',
    commands: [
      { id: 'npm-install', label: 'NPM Install', labelAr: '??????????', command: 'npm install' },
      { id: 'npm-update', label: 'NPM Update', labelAr: '??????????', command: 'npm update' },
      { id: 'npm-publish', label: 'NPM Publish', labelAr: '??????', command: 'npm publish' },
      { id: 'npm-audit', label: 'NPM Audit', labelAr: '?????? ????????????', command: 'npm audit' },
      { id: 'npm-fix', label: 'NPM Audit Fix', labelAr: '?????????? ????????????', command: 'npm audit fix' },
      { id: 'npm-outdated', label: 'Check Outdated', labelAr: '?????? ????????????', command: 'npm outdated' },
    ],
  },
  npx: {
    name: 'NPX',
    nameAr: '???? ???? ??????',
    icon: 'code',
    commands: [
      { id: 'npx-create', label: 'Create App', labelAr: '?????????? ??????????', command: 'npx create-expo-app' },
      { id: 'npx-react-native', label: 'React Native CLI', labelAr: 'React Native CLI', command: 'npx react-native' },
      { id: 'npx-expo', label: 'Expo CLI', labelAr: 'Expo CLI', command: 'npx expo' },
      { id: 'npx-eas', label: 'EAS CLI', labelAr: 'EAS CLI', command: 'npx eas-cli' },
    ],
  },
  git: {
    name: 'Git',
    nameAr: '??????',
    icon: 'code-branch',
    commands: [
      { id: 'git-init', label: 'Git Init', labelAr: '?????????? Git', command: 'git init' },
      { id: 'git-status', label: 'Git Status', labelAr: '???????? Git', command: 'git status' },
      { id: 'git-add', label: 'Git Add All', labelAr: '?????????? ????????', command: 'git add .' },
      { id: 'git-commit', label: 'Git Commit', labelAr: '?????? ??????????????????', command: 'git commit -m' },
      { id: 'git-push', label: 'Git Push', labelAr: '??????', command: 'git push' },
      { id: 'git-pull', label: 'Git Pull', labelAr: '??????', command: 'git pull' },
      { id: 'git-branch', label: 'Git Branch', labelAr: '??????', command: 'git branch' },
      { id: 'git-merge', label: 'Git Merge', labelAr: '??????', command: 'git merge' },
    ],
  },
  github: {
    name: 'GitHub',
    nameAr: '?????? ??????',
    icon: 'logo-github',
    commands: [
      { id: 'github-create', label: 'Create Repo', labelAr: '?????????? ????????????', command: 'gh repo create' },
      { id: 'github-clone', label: 'Clone Repo', labelAr: '?????? ????????????', command: 'gh repo clone' },
      { id: 'github-push', label: 'Push to GitHub', labelAr: '?????? ?????? GitHub', command: 'git push origin main' },
      { id: 'github-pull', label: 'Pull from GitHub', labelAr: '?????? ???? GitHub', command: 'git pull origin main' },
      { id: 'github-issue', label: 'Create Issue', labelAr: '?????????? ??????????', command: 'gh issue create' },
      { id: 'github-pr', label: 'Create PR', labelAr: '?????????? ?????? ??????', command: 'gh pr create' },
    ],
  },
  web: {
    name: 'Web',
    nameAr: '??????',
    icon: 'globe',
    commands: [
      { id: 'web-init', label: 'Web Init', labelAr: '?????????? ?????????? ??????', command: 'npm init' },
      { id: 'web-dev', label: 'Web Dev', labelAr: '?????????? ??????????????', command: 'npm run dev' },
      { id: 'web-build', label: 'Web Build', labelAr: '????????', command: 'npm run build' },
      { id: 'web-serve', label: 'Web Serve', labelAr: '??????????', command: 'npm run serve' },
    ],
  },
  hybrid: {
    name: 'Hybrid',
    nameAr: '????????',
    icon: 'phone-portrait',
    commands: [
      { id: 'hybrid-init', label: 'Ionic Init', labelAr: '?????????? Ionic', command: 'ionic start' },
      { id: 'hybrid-build', label: 'Ionic Build', labelAr: '???????? Ionic', command: 'ionic build' },
      { id: 'hybrid-serve', label: 'Ionic Serve', labelAr: '?????????? Ionic', command: 'ionic serve' },
    ],
  },
  system: {
    name: 'System',
    nameAr: '????????????',
    icon: 'settings',
    commands: [
      { id: 'system-info', label: 'System Info', labelAr: '?????????????? ????????????', command: 'system-info' },
      { id: 'system-clean', label: 'Clean Cache', labelAr: '?????????? ??????????????', command: 'clean-cache' },
      { id: 'system-logs', label: 'View Logs', labelAr: '?????? ??????????????', command: 'view-logs' },
    ],
  },
  rareServices: {
    name: 'RARE 4N Services',
    nameAr: '?????????? RARE 4N',
    icon: 'apps',
    commands: [
      { id: 'backend-start', label: 'Start Backend', labelAr: '?????????? Backend', command: 'start-backend' },
      { id: 'backend-stop', label: 'Stop Backend', labelAr: '?????????? Backend', command: 'stop-backend' },
      { id: 'backend-restart', label: 'Restart Backend', labelAr: '?????????? ?????????? Backend', command: 'restart-backend' },
      { id: 'backend-status', label: 'Backend Status', labelAr: '???????? Backend', command: 'backend-status' },
      { id: 'cloudflare-start', label: 'Start Cloudflare', labelAr: '?????????? Cloudflare', command: 'start-cloudflare' },
      { id: 'cloudflare-stop', label: 'Stop Cloudflare', labelAr: '?????????? Cloudflare', command: 'stop-cloudflare' },
      { id: 'cloudflare-restart', label: 'Restart Cloudflare', labelAr: '?????????? ?????????? Cloudflare', command: 'restart-cloudflare' },
      { id: 'cloudflare-status', label: 'Cloudflare Status', labelAr: '???????? Cloudflare', command: 'cloudflare-status' },
      { id: 'widget-start', label: 'Start Widget', labelAr: '?????????? Widget', command: 'start-widget' },
      { id: 'widget-stop', label: 'Stop Widget', labelAr: '?????????? Widget', command: 'stop-widget' },
      { id: 'widget-restart', label: 'Restart Widget', labelAr: '?????????? ?????????? Widget', command: 'restart-widget' },
      { id: 'widget-status', label: 'Widget Status', labelAr: '???????? Widget', command: 'widget-status' },
      { id: 'client-portal-link', label: 'Generate Portal Link', labelAr: '?????????? ???????? Portal', command: 'generate-portal-link' },
      { id: 'client-portal-status', label: 'Portal Status', labelAr: '???????? Portal', command: 'portal-status' },
    ],
  },
};

export default function AppBuilder() {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ uri: string; name: string; type: string }>>([]);
  const [libraries, setLibraries] = useState<{ templates: any[]; systems: any[]; themes: any[] }>({
    templates: [],
    systems: [],
    themes: [],
  });
  const [clientRequests, setClientRequests] = useState<Array<{
    id: string;
    clientId: string;
    clientName: string;
    phone: string;
    email: string;
    type: string;
    content: any;
    timestamp: number;
    status: string;
  }>>([]);
  const [builds, setBuilds] = useState<Array<{
    buildId: string;
    projectName: string;
    builds: Array<{ filename: string; size: number; downloadUrl: string }>;
    createdAt: number;
  }>>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  
  const { theme, colors } = useTheme();
  const kernel = RAREKernel.getInstance();
  const { executeAction: executeBuilderAction } = useKernelAgent('builder');
  const { executeAction: executePortalAction, listenForEvents: listenPortalEvents } = useKernelAgent('portal');
  const scrollViewRef = useRef<ScrollView>(null);
  const terminalIntegration = new TerminalIntegrationService();

  useEffect(() => {
    // #region agent log
    if (__DEV__) {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:useEffect:portal',message:'AppBuilder mounted',data:{},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UI_MOUNT'})}).catch(()=>{});
    }
    // #endregion

    try {
      // ??? ???????????????? ???????????? PortalAgent (???? WebSocket ??????????)
      const unsubscribePortalRequest = kernel.on('portal:request', (event) => {
      const request = event.data;
      setClientRequests(prev => [request, ...prev]);
      setTerminalOutput(prev => [
        ...prev,
        `[CLIENT REQUEST] ${request.clientName} (${request.phone}): ${typeof request.content === 'string' ? request.content : JSON.stringify(request.content)}`,
      ]);
      
      // Show notification
      Alert.alert(
        '?????? ???????? ???? ????????????',
        `${request.clientName}: ${typeof request.content === 'string' ? request.content : JSON.stringify(request.content)}`,
        [
          { text: '??????????', style: 'cancel' },
          {
            text: '?????? ????????????????',
            onPress: () => {
              Alert.alert(
                '???????????? ????????????',
                `??????????: ${request.clientName}\n????????????: ${request.phone}\n????????????: ${request.email}\n\n??????????: ${typeof request.content === 'string' ? request.content : JSON.stringify(request.content)}`,
              );
            },
          },
        ]
      );
    });

    // ??? ???????????????? ???? build completion ???? BuilderAgent
    const unsubscribeBuildCompleted = kernel.on('agent:builder:response', (event) => {
      if (event.data.build && event.data.build.completed) {
        const data = event.data.build;
        setTerminalOutput(prev => [
          ...prev,
          `[BUILD COMPLETED] ${data.projectName || 'Project'}`,
          `Files: ${data.builds?.map((b: any) => b.filename).join(', ') || 'N/A'}`,
        ]);
        setIsBuilding(false);
        loadBuilds();
        Alert.alert(
          '???? ???????????? ??????????',
          `???? ?????????? ?????????????? ?????? ${data.email || '???????????? ????????????????????'}`,
        );
      }
    });

    // ??? ???????????????? ???? client connected/disconnected ???? PortalAgent
    const unsubscribeClientConnected = kernel.on('portal:client:connected', (event) => {
      const data = event.data;
      setTerminalOutput(prev => [
        ...prev,
        `[CLIENT CONNECTED] ${data.clientName} (${data.clientId})`,
      ]);
    });

    const unsubscribeClientDisconnected = kernel.on('portal:client:disconnected', (event) => {
      const data = event.data;
      setTerminalOutput(prev => [
        ...prev,
        `[CLIENT DISCONNECTED] ${data.clientName} (${data.clientId})`,
      ]);
    });

      return () => {
        unsubscribePortalRequest();
        unsubscribeBuildCompleted();
        unsubscribeClientConnected();
        unsubscribeClientDisconnected();
      };
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:useEffect:portal',message:'AppBuilder useEffect error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UI_EFFECT_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('AppBuilder useEffect error:', error);
    }
  }, []);

  useEffect(() => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:useEffect:builder',message:'Setting up BuilderAgent listeners',data:{},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UI_LISTENERS'})}).catch(()=>{});
      }
      // #endregion

      // ??? ???????????????? ???????????? CognitiveLoop ??? Agent ??? Response
      const unsubscribeBuilder = kernel.on('agent:builder:response', (event) => {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:useEffect:builder',message:'BuilderAgent response received',data:{hasOutput:!!event.data.output,hasLibraries:!!event.data.libraries,hasBuild:!!event.data.build,hasTerminal:!!event.data.terminal},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UI_RESPONSE'})}).catch(()=>{});
        }
        // #endregion

        try {
          if (event.data.output) {
            setTerminalOutput(prev => [...prev, event.data.output]);
          }
          if (event.data.libraries) {
            setLibraries(event.data.libraries);
          }
          if (event.data.build) {
            setTerminalOutput(prev => [...prev, `[BUILD] ${event.data.build.projectName || 'Project'} completed`]);
            loadBuilds();
          }
          if (event.data.terminal) {
            const terminalOutput = typeof event.data.terminal === 'string' 
              ? event.data.terminal 
              : event.data.terminal.output || JSON.stringify(event.data.terminal);
            setTerminalOutput(prev => [...prev, terminalOutput]);
          }
        } catch (updateError: any) {
          // #region agent log
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:useEffect:builder',message:'BuilderAgent response update error',data:{error:updateError.message},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UI_UPDATE_ERROR'})}).catch(()=>{});
          }
          // #endregion
          console.error('BuilderAgent response update error:', updateError);
        }
      });

      // ??? ???????????????? ???????????? BuilderAgent
      const unsubscribeBuilderError = kernel.on('agent:builder:error', (event) => {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:useEffect:builder',message:'BuilderAgent error received',data:{error:event.data.error},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UI_ERROR'})}).catch(()=>{});
        }
        // #endregion
        setTerminalOutput(prev => [...prev, `[ERROR] ${event.data.error || 'Unknown error'}`]);
        Alert.alert('??????', event.data.error || '?????? ??????');
      });

      // ??? ???????????????? ???? terminal output ???? Socket.IO
      const unsubscribeTerminalOutput = kernel.on('builder:terminal:output', (event) => {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:useEffect:builder',message:'Terminal output received',data:{outputType:event.data.type,hasOutput:!!event.data.output},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UI_TERMINAL_OUTPUT'})}).catch(()=>{});
        }
        // #endregion
        if (event.data.output) {
          setTerminalOutput(prev => [...prev, event.data.output]);
        }
        if (event.data.error) {
          setTerminalOutput(prev => [...prev, `[ERROR] ${event.data.error}`]);
        }
      });

      // ??? ???????????????? ???????????? Loyalty
      const unsubscribeLoyaltyPoints = kernel.on('loyalty:points_added', (event) => {
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:useEffect:builder',message:'Loyalty points added',data:{points:event.data.points?.total},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'LOYALTY_POINTS_ADDED'})}).catch(()=>{});
        }
        setLoyaltyPoints(event.data.points?.total || 0);
        // ?????????? ?????????? ???? Terminal
        setTerminalOutput(prev => [
          ...prev,
          `[LOYALTY] +${event.data.reward?.points || 0} points earned! Total: ${event.data.points?.total || 0}`,
        ]);
      });
      
      // Load builds on mount
      loadBuilds();
      
      return () => {
        unsubscribeBuilder();
        unsubscribeBuilderError();
        unsubscribeTerminalOutput();
        unsubscribeLoyaltyPoints();
      };
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:useEffect:builder',message:'BuilderAgent useEffect error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UI_EFFECT_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('BuilderAgent useEffect error:', error);
    }
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [terminalOutput]);

  const handleCommand = (command: string, commandId?: string) => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleCommand',message:'Command execution started',data:{command,commandId},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_COMMAND_START'})}).catch(()=>{});
      }
      // #endregion

      // Validate command
      if (!command || typeof command !== 'string' || !command.trim()) {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleCommand',message:'Invalid command',data:{command},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_COMMAND_INVALID'})}).catch(()=>{});
        }
        // #endregion
        setTerminalOutput(prev => [...prev, '[ERROR] Invalid command']);
        return;
      }

      // Security: Block dangerous commands
      const dangerousCommands = ['rm -rf', 'format', 'del /f', 'shutdown', 'reboot', 'sudo'];
      const lowerCommand = command.toLowerCase();
      if (dangerousCommands.some(cmd => lowerCommand.includes(cmd))) {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleCommand',message:'Dangerous command blocked',data:{command},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_COMMAND_DANGEROUS'})}).catch(()=>{});
        }
        // #endregion
        setTerminalOutput(prev => [...prev, '[SECURITY] Dangerous command blocked']);
        Alert.alert('?????? ????????', '?????? ?????????? ?????????? ???????????? ??????????');
        return;
      }

      // Add command to terminal output
      setTerminalOutput(prev => [...prev, `$ ${command}`]);

      // ??? ???????????? ?????????? ???????? ?????????????? ???? ????????????
      if (command.startsWith('send-whatsapp') || command.startsWith('send-email') || command.startsWith('send-sms') || command.startsWith('make-call') || command.startsWith('notify-client') || command.startsWith('generate-portal-link')) {
        handleClientCommand(command, commandId);
        return;
      }

      // ??? ???????????? ?????????? ?????????? ??????????????
      if (command.startsWith('generate-image') || command.startsWith('generate-video') || command.startsWith('generate-file')) {
        handleMediaCommand(command, commandId);
        return;
      }

      // ??? ?????????? ?????? Kernel ??? CognitiveLoop ??? BuilderAgent
      kernel.emit({
        type: 'user:input',
        data: {
          text: `execute command: ${command}`,
          type: 'builder',
          command,
          commandId,
        },
        source: 'ui',
      });

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleCommand',message:'Command emitted to Kernel',data:{command,commandId},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_COMMAND_EMITTED'})}).catch(()=>{});
      }
      // #endregion
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleCommand',message:'Command execution error',data:{error:error.message,command},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_COMMAND_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Command execution error:', error);
      setTerminalOutput(prev => [...prev, `[ERROR] ${error.message || '?????? ?????????? ??????????'}`]);
      Alert.alert('??????', error.message || '?????? ?????????? ??????????');
    }
  };

  const handleTerminalSubmit = () => {
    if (!terminalInput.trim()) return;

    setTerminalOutput(prev => [...prev, `$ ${terminalInput}`]);
    handleCommand(terminalInput);
    setTerminalInput('');
  };

  // ??? ???????????? ?????????? ?????????????? ???? ????????????
  const handleClientCommand = async (command: string, commandId?: string) => {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleClientCommand',message:'Client command started',data:{command,commandId},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'CLIENT_COMMAND_START'})}).catch(()=>{});
      }

      const parts = command.split(' ');
      const action = parts[0];

      // ???????????? ?????? ?????????????? ???????????? ???? ?????????? ????????????
      const selectedRequest = clientRequests[0]; // ???????? ???????????? ?????????????? ???????????? ????????????
      
      if (!selectedRequest) {
        setTerminalOutput(prev => [...prev, '[ERROR] ???? ???????? ???????? ????????']);
        return;
      }

      switch (action) {
        case 'send-whatsapp':
          const whatsappMessage = parts.slice(1).join(' ') || '???? ?????????? ???????? ??????????????';
          await terminalIntegration.sendWhatsApp(selectedRequest.phone, whatsappMessage);
          setTerminalOutput(prev => [...prev, `[WHATSAPP] ???? ?????????????? ?????? ${selectedRequest.phone}`]);
          break;

        case 'send-email':
          const emailSubject = parts[1] || '???? ?????????? ???????? ??????????????';
          const emailBody = parts.slice(2).join(' ') || '???? ?????????? ???????? ?????????????? ??????????';
          await terminalIntegration.sendEmail(selectedRequest.email, emailSubject, emailBody);
          setTerminalOutput(prev => [...prev, `[EMAIL] ???? ?????????????? ?????? ${selectedRequest.email}`]);
          break;

        case 'send-sms':
          const smsMessage = parts.slice(1).join(' ') || '???? ?????????? ???????? ??????????????';
          await terminalIntegration.sendSMS(selectedRequest.phone, smsMessage);
          setTerminalOutput(prev => [...prev, `[SMS] ???? ?????????????? ?????? ${selectedRequest.phone}`]);
          break;

        case 'make-call':
          await terminalIntegration.makePhoneCall(selectedRequest.phone);
          setTerminalOutput(prev => [...prev, `[CALL] ???????? ?????????????? ???? ${selectedRequest.phone}`]);
          break;

        case 'notify-client':
          const notifyMessage = parts.slice(1).join(' ') || '???? ?????????? ???????? ??????????????';
          await terminalIntegration.notifyClientComprehensive(
            selectedRequest.clientId,
            selectedRequest.phone,
            selectedRequest.email,
            notifyMessage
          );
          setTerminalOutput(prev => [...prev, `[NOTIFY] ???? ?????????? ?????????? ???????? ???????????? ${selectedRequest.clientName}`]);
          break;

        case 'generate-portal-link':
          const link = await terminalIntegration.generateClientPortalLink(selectedRequest.clientId, selectedRequest.id);
          setTerminalOutput(prev => [...prev, `[PORTAL] ???????? Portal: ${link}`]);
          break;

        default:
          setTerminalOutput(prev => [...prev, `[ERROR] ?????? ?????? ??????????: ${action}`]);
      }

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleClientCommand',message:'Client command completed',data:{command,action},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'CLIENT_COMMAND_SUCCESS'})}).catch(()=>{});
      }
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleClientCommand',message:'Client command error',data:{error:error.message,command},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'CLIENT_COMMAND_ERROR'})}).catch(()=>{});
      }
      console.error('Client command error:', error);
      setTerminalOutput(prev => [...prev, `[ERROR] ${error.message || '?????? ?????????? ??????????'}`]);
    }
  };

  // ??? ???????????? ?????????? ?????????? ??????????????
  const handleMediaCommand = async (command: string, commandId?: string) => {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleMediaCommand',message:'Media command started',data:{command,commandId},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'MEDIA_COMMAND_START'})}).catch(()=>{});
      }

      const parts = command.split(' ');
      const action = parts[0];
      const prompt = parts.slice(1).join(' ') || '';

      switch (action) {
        case 'generate-image':
          await terminalIntegration.generateImage(prompt);
          setTerminalOutput(prev => [...prev, `[IMAGE] ???????? ?????????? ????????????...`]);
          break;

        case 'generate-video':
          await terminalIntegration.generateVideo(prompt);
          setTerminalOutput(prev => [...prev, `[VIDEO] ???????? ?????????? ??????????????...`]);
          break;

        case 'generate-file':
          const fileType = parts[1] || 'text';
          const fileContent = parts.slice(2).join(' ') || '';
          await terminalIntegration.generateFile(fileType, fileContent);
          setTerminalOutput(prev => [...prev, `[FILE] ???????? ?????????? ??????????...`]);
          break;

        default:
          setTerminalOutput(prev => [...prev, `[ERROR] ?????? ?????? ??????????: ${action}`]);
      }

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleMediaCommand',message:'Media command completed',data:{command,action},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'MEDIA_COMMAND_SUCCESS'})}).catch(()=>{});
      }
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleMediaCommand',message:'Media command error',data:{error:error.message,command},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'MEDIA_COMMAND_ERROR'})}).catch(()=>{});
      }
      console.error('Media command error:', error);
      setTerminalOutput(prev => [...prev, `[ERROR] ${error.message || '?????? ?????????? ??????????'}`]);
    }
  };

  const handleSendResponseToClient = async (requestId: string, clientId: string, response: string) => {
    try {
      // ??? ?????????? ?????? Kernel ??? CognitiveLoop ??? PortalAgent
      await executePortalAction('update_request', {
        requestId,
        clientId,
        response,
        status: 'responded',
      });
      
      setTerminalOutput(prev => [
        ...prev,
        `[RESPONSE SENT] To ${clientId}: ${response}`,
      ]);
    } catch (error) {
      console.error('Send response error:', error);
    }
  };

  const handleAgreeWithClient = async (requestId: string, clientId: string, amount: number) => {
    try {
      // ??? Update request via Portal Agent through Kernel
      await executePortalAction('update_request', {
        requestId,
        status: 'agreed',
        response: `???? ?????????????? ?????? ??????????. ????????????: ${amount} ????????`,
        amount,
      });

      // ??? Create invoice via Portal Agent through Kernel
      await executePortalAction('create_invoice', {
        requestId,
        amount,
        description: '???????? RARE 4N',
        items: [
          {
            name: '???????? RARE 4N',
            quantity: 1,
            price: amount,
          },
        ],
      });

      // Listen for results
      const unsubscribe = listenPortalEvents('portal:invoice:created', (invoiceData: any) => {
        if (invoiceData.success) {
          setTerminalOutput(prev => [
            ...prev,
            `[AGREEMENT] Client ${clientId} agreed. Amount: ${amount} SAR`,
            `[INVOICE] Created: ${invoiceData.invoice.id}`,
            `[PAYMENT] Link sent to client`,
          ]);

          Alert.alert('??????', `???? ?????????????? ???????????? ????????????????. ???????? ?????????? ?????????? ????????????.`);
        }
      });

      // Cleanup after 30 seconds
      setTimeout(() => {
        unsubscribe();
      }, 30000);
    } catch (error) {
      console.error('Agree with client error:', error);
      Alert.alert('??????', '?????? ?????????????? ???? ????????????');
    }
  };

  const handleUploadImage = async () => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleUploadImage',message:'Upload image initiated',data:{},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UPLOAD_IMAGE_START'})}).catch(()=>{});
      }
      // #endregion

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const file = {
          uri: result.assets[0].uri,
          name: result.assets[0].uri.split('/').pop() || 'image.png',
          type: 'image',
        };
        setUploadedFiles(prev => [...prev, file]);

        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleUploadImage',message:'Image selected',data:{fileName:file.name,fileType:file.type},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UPLOAD_IMAGE_SELECTED'})}).catch(()=>{});
        }
        // #endregion

        // ??? ?????????? ?????? Kernel ??? CognitiveLoop
        kernel.emit({
          type: 'user:input',
          data: {
            text: 'add image to project',
            type: 'builder',
            file,
          },
          source: 'ui',
        });

        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleUploadImage',message:'Image upload emitted to Kernel',data:{fileName:file.name},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UPLOAD_IMAGE_EMITTED'})}).catch(()=>{});
        }
        // #endregion
      } else {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleUploadImage',message:'Image upload cancelled',data:{},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UPLOAD_IMAGE_CANCELLED'})}).catch(()=>{});
        }
        // #endregion
      }
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleUploadImage',message:'Upload image error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UPLOAD_IMAGE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Upload error:', error);
      Alert.alert('??????', error.message || '?????? ?????? ????????????');
    }
  };

  const handleUploadFile = async () => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleUploadFile',message:'Upload file initiated',data:{},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UPLOAD_FILE_START'})}).catch(()=>{});
      }
      // #endregion

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCREMOVED: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = {
          uri: result.assets[0].uri,
          name: result.assets[0].name,
          type: 'file',
        };
        setUploadedFiles(prev => [...prev, file]);

        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleUploadFile',message:'File selected',data:{fileName:file.name,fileType:file.type},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UPLOAD_FILE_SELECTED'})}).catch(()=>{});
        }
        // #endregion

        // ??? ?????????? ?????? Kernel ??? CognitiveLoop
        kernel.emit({
          type: 'user:input',
          data: {
            text: 'add file to project',
            type: 'builder',
            file,
          },
          source: 'ui',
        });

        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleUploadFile',message:'File upload emitted to Kernel',data:{fileName:file.name},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UPLOAD_FILE_EMITTED'})}).catch(()=>{});
        }
        // #endregion
      } else {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleUploadFile',message:'File upload cancelled',data:{},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UPLOAD_FILE_CANCELLED'})}).catch(()=>{});
        }
        // #endregion
      }
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:handleUploadFile',message:'Upload file error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_UPLOAD_FILE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Upload error:', error);
      Alert.alert('??????', error.message || '?????? ?????? ??????????');
    }
  };

  const handleBuild = async () => {
    try {
      // Get project name and client info
      Alert.prompt(
        '???????? ??????????????',
        '???????? ?????? ??????????????:',
        [
          { text: '??????????', style: 'cancel' },
          {
            text: '????????',
            onPress: async (projectName) => {
              if (!projectName) return;

              // Get client email and phone from first request or prompt
              const clientEmail = clientRequests.length > 0 
                ? clientRequests[0].email 
                : await new Promise<string | null>((resolve) => {
                    Alert.prompt(
                      '???????????? ????????????????????',
                      '???????? ???????????? ???????????????????? ???????????? ??????????????:',
                      [
                        { text: '??????????', style: 'cancel', onPress: () => resolve(null) },
                        { text: '??????????', onPress: (email) => resolve(email || null) },
                      ],
                      'plain-text'
                    );
                  });

              const clientPhone = clientRequests.length > 0 
                ? clientRequests[0].phone 
                : await new Promise<string | null>((resolve) => {
                    Alert.prompt(
                      '?????? ????????????',
                      '???????? ?????? ???????????? ???????????? ??????????????:',
                      [
                        { text: '??????????', style: 'cancel', onPress: () => resolve(null) },
                        { text: '??????????', onPress: (phone) => resolve(phone || null) },
                      ],
                      'plain-text'
                    );
                  });

              if (!clientEmail) {
                Alert.alert('??????', '???????????? ???????????????????? ??????????');
                return;
              }

              setIsBuilding(true);
              setTerminalOutput(prev => [...prev, `[BUILD STARTED] ${projectName}`]);

              // Create FormData for file upload
              const formData = new FormData();
              formData.append('projectName', projectName || '');
              formData.append('email', clientEmail || '');
              if (clientPhone) formData.append('phone', clientPhone);
              formData.append('platforms', 'ios,android,web');
              formData.append('projectType', 'react-native');

              // Add uploaded files
              uploadedFiles.forEach((file, index) => {
                formData.append('files', {
                  uri: file.uri,
                  name: file.name,
                  type: 'application/octet-stream',
                } as any);
              });

              // ??? ?????????? ?????? Kernel ??? CognitiveLoop ??? BuilderAgent
              setIsBuilding(true);
              setTerminalOutput(prev => [...prev, `[BUILD STARTED] ${projectName}`]);
              
              // Execute action - results will come via Kernel events
              executeBuilderAction('build_app', {
                projectName,
                email: clientEmail,
                phone: clientPhone,
                platforms: 'ios,android,web',
                projectType: 'react-native',
                files: uploadedFiles,
                clientId: clientRequests.length > 0 ? clientRequests[0].clientId : undefined,
                clientEmail,
                requestId: clientRequests.length > 0 ? clientRequests[0].id : undefined,
                paymentStatus: 'pending', // Will be updated when payment is confirmed
              }).catch((error: any) => {
                setTerminalOutput(prev => [...prev, `[BUILD ERROR] ${error.message || '?????? ????????????'}`]);
                setIsBuilding(false);
                Alert.alert('??????', error.message || '?????? ????????????');
              });
            },
          },
        ],
        'plain-text'
      );
    } catch (error) {
      console.error('Build error:', error);
      setIsBuilding(false);
      Alert.alert('??????', '?????? ????????????');
    }
  };

  const loadBuilds = async () => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:loadBuilds',message:'Loading builds started',data:{},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_LOAD_BUILDS_START'})}).catch(()=>{});
      }
      // #endregion

      const response = await fetch(`${API_URL}/api/auto-builder/builds`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:loadBuilds',message:'Builds loaded successfully',data:{buildsCount:data.builds?.length || 0},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_LOAD_BUILDS_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      if (data.builds) {
        setBuilds(data.builds);
      }
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:loadBuilds',message:'Load builds error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_LOAD_BUILDS_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Load builds error:', error);
      setTerminalOutput(prev => [...prev, `[ERROR] Failed to load builds: ${error.message || 'Unknown error'}`]);
    }
  };

  const loadLibraries = async () => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:loadLibraries',message:'Loading libraries started',data:{},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_LOAD_LIBRARIES_START'})}).catch(()=>{});
      }
      // #endregion

      // ??? ?????????????? BuilderAgent ?????? Kernel
      await executeBuilderAction('load_libraries', {});

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:loadLibraries',message:'Load libraries action executed',data:{},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_LOAD_LIBRARIES_EXECUTED'})}).catch(()=>{});
      }
      // #endregion
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:loadLibraries',message:'Load libraries error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_LOAD_LIBRARIES_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Load libraries error:', error);
      setTerminalOutput(prev => [...prev, `[ERROR] Failed to load libraries: ${error.message || 'Unknown error'}`]);
    }
  };


  const handleDownload = async (downloadUrl: string, filename: string) => {
    try {
      // ??? ?????????? ?????? Kernel ??? CognitiveLoop ??? BuilderAgent
      // Results will come via Kernel events (agent:builder:response)
      executeBuilderAction('download_build', { downloadUrl, filename }).catch((error: any) => {
        console.error('Download error:', error);
        Alert.alert('??????', error.message || '?????? ??????????????');
      });
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert('??????', error.message || '?????? ??????????????');
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
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>???????? ??????????????????</Text>
          {loyaltyPoints > 0 && (
            <View style={[styles.loyaltyBadge, { bREMOVED: colors.primary }]}>
              <Icon name="star" size={14} color="#000" />
              <Text style={styles.loyaltyPointsText}>{loyaltyPoints}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Client Requests Section */}
        {clientRequests.length > 0 && (
          <View style={[styles.section, { borderColor: colors.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              ?????????? ?????????????? ({clientRequests.length})
            </Text>
            {clientRequests.slice(0, 5).map((request) => (
              <View
                key={request.id}
                style={[styles.requestCard, { borderColor: colors.primary }]}
              >
                <View style={styles.requestHeader}>
                  <Text style={[styles.requestName, { color: colors.text }]}>
                    {request.clientName}
                  </Text>
                  <Text style={[styles.requestPhone, { color: colors.textSecondary }]}>
                    {request.phone}
                  </Text>
                </View>
                <Text style={[styles.requestContent, { color: colors.text }]}>
                  {typeof request.content === 'string' ? request.content : JSON.stringify(request.content)}
                </Text>
                <View style={styles.requestActions}>
                  <Pressable
                    style={[styles.responseButton, { bREMOVED: colors.primary }]}
                    onPress={() => {
                      Alert.prompt(
                        '?????????? ????',
                        '???????? ?????? ????????????:',
                        [
                          { text: '??????????', style: 'cancel' },
                          {
                            text: '??????????',
                            onPress: (response) => {
                              if (response) {
                                handleSendResponseToClient(request.id, request.clientId, response);
                              }
                            },
                          },
                        ],
                        'plain-text'
                      );
                    }}
                  >
                    <Text style={styles.responseButtonText}>????</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.agreeButton, { bREMOVED: '#00ff00' }]}
                    onPress={() => {
                      Alert.prompt(
                        '?????????????? ?????? ??????????',
                        '???????? ???????????? ???????????? ????????:',
                        [
                          { text: '??????????', style: 'cancel' },
                          {
                            text: '??????????',
                            onPress: (amount) => {
                              if (amount && !isNaN(parseFloat(amount))) {
                                handleAgreeWithClient(request.id, request.clientId, parseFloat(amount));
                              }
                            },
                          },
                        ],
                        'plain-text'
                      );
                    }}
                  >
                    <Text style={styles.responseButtonText}>??????????</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.callButton, { borderColor: colors.primary }]}
                    onPress={() => {
                      Alert.alert('??????????', `?????????????? ???? ${request.phone}`);
                    }}
                  >
                    <Icon name="phone" size={18} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    style={[styles.emailButton, { borderColor: colors.primary }]}
                    onPress={() => {
                      Alert.alert('????????', `?????????? ???????? ?????? ${request.email}`);
                    }}
                  >
                    <Icon name="email" size={18} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Upload Section */}
        <View style={[styles.uploadSection, { borderColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>?????????? ?????????? ??????????????</Text>
          <View style={styles.uploadButtons}>
            <Pressable
              style={[styles.uploadButton, { bREMOVED: colors.primary }]}
              onPress={handleUploadImage}
            >
              <Icon name="image" size={18} color="#000" />
              <Text style={styles.uploadButtonText}>????????</Text>
            </Pressable>
            <Pressable
              style={[styles.uploadButton, { bREMOVED: colors.primary }]}
              onPress={handleUploadFile}
            >
              <Icon name="file" size={18} color="#000" />
              <Text style={styles.uploadButtonText}>??????</Text>
            </Pressable>
            <Pressable
              style={[styles.buildButton, { bREMOVED: isBuilding ? '#666' : '#00ff00' }]}
              onPress={handleBuild}
              disabled={isBuilding}
            >
              <Text style={styles.buildButtonText}>
                {isBuilding ? '???????? ????????????...' : '???????? ??????????????'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Builds Section */}
        {builds.length > 0 && (
          <View style={[styles.section, { borderColor: colors.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              ?????????????? ?????????????? ({builds.length})
            </Text>
            {builds.map((build) => (
              <View key={build.buildId} style={[styles.buildCard, { borderColor: colors.primary }]}>
                <Text style={[styles.buildProjectName, { color: colors.text }]}>
                  {build.projectName}
                </Text>
                <Text style={[styles.buildDate, { color: colors.textSecondary }]}>
                  {new Date(build.createdAt).toLocaleString('ar-SA')}
                </Text>
                {build.builds.map((file, index) => (
                  <Pressable
                    key={index}
                    style={[styles.downloadButton, { borderColor: colors.primary }]}
                    onPress={() => handleDownload(file.downloadUrl, file.filename)}
                  >
                    <Icon name="download" size={18} color={colors.primary} />
                    <Text style={[styles.downloadText, { color: colors.text }]}>
                      {file.filename} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Command Groups - ???????????? ?????????????? ?????????????? */}
        <View style={[styles.commandGroupsSection, { borderColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>???????????? ?????????????? ??????????????</Text>
          
          {/* Group Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupsScroll}>
            {Object.entries(COMMAND_GROUPS).map(([groupKey, group]) => {
              const isSelected = selectedGroup === groupKey;
              return (
                <Pressable
                  key={groupKey}
                  style={[
                    styles.groupTab,
                    {
                      bREMOVED: isSelected ? colors.primary : 'rgba(255,255,255,0.05)',
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => {
                    // #region agent log
                    if (__DEV__) {
                      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:groupTab',message:'Command group selected',data:{groupKey,groupName:group.name,isSelected},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_GROUP_SELECTED'})}).catch(()=>{});
                    }
                    // #endregion
                    setSelectedGroup(isSelected ? null : groupKey);
                  }}
                >
                  <View style={styles.groupTabContent}>
                    <Icon 
                      name={group.icon || 'code'} 
                      size={18} 
                      color={isSelected ? '#000' : colors.primary} 
                    />
                    <Text style={[
                      styles.groupTabText,
                      { color: isSelected ? '#000' : colors.text }
                    ]}>
                      {group.nameAr || group.name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Command Cards */}
          {selectedGroup && COMMAND_GROUPS[selectedGroup as keyof typeof COMMAND_GROUPS] && (
            <View style={styles.commandsGrid}>
              {COMMAND_GROUPS[selectedGroup as keyof typeof COMMAND_GROUPS].commands.map((cmd) => (
                <Pressable
                  key={cmd.id}
                  style={[styles.commandCard, { 
                    borderColor: colors.primary,
                    bREMOVED: 'rgba(255,255,255,0.03)',
                  }]}
                  onPress={() => {
                    // #region agent log
                    if (__DEV__) {
                      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/app-builder.tsx:commandCard',message:'Command card pressed',data:{commandId:cmd.id,command:cmd.command,label:cmd.labelAr || cmd.label},timestamp:Date.now(),sessionId:'builder-ui-session',runId:'run1',hypothesisId:'BUILDER_COMMAND_CARD'})}).catch(()=>{});
                    }
                    // #endregion
                    handleCommand(cmd.command, cmd.id);
                  }}
                >
                  <View style={styles.commandCardHeader}>
                    <Icon name="task" size={16} color={colors.primary} />
                    <Text style={[styles.commandLabel, { color: colors.text }]}>
                      {cmd.labelAr || cmd.label}
                    </Text>
                  </View>
                  {cmd.label !== cmd.labelAr && (
                    <Text style={[styles.commandLabelEn, { color: colors.textSecondary, fontSize: 11 }]}>
                      {cmd.label}
                    </Text>
                  )}
                  <Text style={[styles.commandText, { color: colors.textSecondary }]}>{cmd.command}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Terminal */}
        <View style={[styles.terminalSection, { borderColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Terminal</Text>
          <ScrollView
            ref={scrollViewRef}
            style={styles.terminalOutput}
            contentContainerStyle={styles.terminalContent}
          >
            {terminalOutput.map((line, index) => (
              <Text key={index} style={[styles.terminalLine, { color: colors.text }]}>
                {line}
              </Text>
            ))}
          </ScrollView>
          <View style={[styles.terminalInputContainer, { borderColor: colors.primary }]}>
            <Text style={[styles.terminalPrompt, { color: colors.primary }]}>$</Text>
            <TextInput
              style={[styles.terminalInput, { color: colors.text }]}
              value={terminalInput}
              onChangeText={setTerminalInput}
              onSubmitEditing={handleTerminalSubmit}
              placeholder="???????? ??????????..."
              plREMOVED={colors.primary + '50'}
            />
          </View>
        </View>
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loyaltyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  loyaltyPointsText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
    bREMOVED: 'rgba(255,255,255,0.03)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'right',
  },
  requestCard: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    bREMOVED: 'rgba(255,255,255,0.05)',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
  },
  requestPhone: {
    fontSize: 12,
  },
  requestContent: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'right',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  responseButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  responseButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  agreeButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  buildButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buildButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  buildCard: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    bREMOVED: 'rgba(255,255,255,0.05)',
  },
  buildProjectName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  buildDate: {
    fontSize: 12,
    marginBottom: 10,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  downloadText: {
    fontSize: 14,
    flex: 1,
  },
  uploadSection: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
    bREMOVED: 'rgba(255,255,255,0.03)',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 6,
  },
  uploadButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  commandGroupsSection: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    bREMOVED: 'rgba(255,255,255,0.03)',
  },
  groupsScroll: {
    marginBottom: 15,
    marginTop: 12,
  },
  groupTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 100,
  },
  groupTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  commandsGrid: {
    gap: 10,
    marginTop: 15,
  },
  commandCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
  },
  commandCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  commandLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  commandText: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'right',
    paddingLeft: 24,
  },
  terminalSection: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    bREMOVED: 'rgba(0,0,0,0.5)',
    minHeight: 300,
  },
  terminalOutput: {
    maxHeight: 200,
    marginBottom: 10,
  },
  terminalContent: {
    paddingBottom: 10,
  },
  terminalLine: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  terminalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    bREMOVED: 'rgba(255,255,255,0.05)',
  },
  terminalPrompt: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  terminalInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});


