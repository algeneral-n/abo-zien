/**
 * ABO ZIEN - Unified RARE System
 * نقطة الدخول الرئيسية - تجميع كل الأنظمة
 */

// Core Systems (Mobile)
export { RAREKernel } from './core/RAREKernel';
export { CognitiveLoop } from './core/CognitiveLoop';
export { ContextStore } from './core/ContextStore';
export { EventBus } from './core/EventBus';
export { RAREEngine } from './core/RAREEngine';
export { VisualPresence } from './core/VisualPresence';
export { AmbientAwareness } from './core/AmbientAwareness';

// Import Core Systems for initialization
import { RAREKernel } from './core/RAREKernel';
import { CognitiveLoop } from './core/CognitiveLoop';
import { VisualPresence } from './core/VisualPresence';
import { AmbientAwareness } from './core/AmbientAwareness';

// Core Systems (Backend)
export { RAREKernel as BackendRAREKernel } from './core/BackendRAREKernel';
export { RAREGateway } from './core/RAREGateway';
export { RARECognition } from './core/RARECognition';
export { RAREContextManager } from './core/RAREContextManager';
export { RAREPersonalityEngine } from './core/RAREPersonalityEngine';
export { RAREPlanner } from './core/RAREPlanner';
export { RAREDialectEngine } from './core/RAREDialectEngine';
export { RAREEmotionEngine } from './core/RAREEmotionEngine';
export { RAREThemeEngine } from './core/RAREThemeEngine';
export { RAREVoiceOS } from './core/RAREVoiceOS';

// Engines/Agents
export { AIEngine } from './engines/AIEngine';
export { BuilderAgent } from './engines/BuilderAgent';
export { FilingAgent } from './engines/FilingAgent';
export { LoyaltyAgent } from './engines/LoyaltyAgent';
export { PortalAgent } from './engines/PortalAgent';
export { ResearchAgent } from './engines/ResearchAgent';
export { VaultAgent } from './engines/VaultAgent';
export { VoiceAgent } from './engines/VoiceAgent';

// Import Engines for initialization
import { AIEngine } from './engines/AIEngine';
import { BuilderAgent } from './engines/BuilderAgent';
import { FilingAgent } from './engines/FilingAgent';
import { LoyaltyAgent } from './engines/LoyaltyAgent';
import { PortalAgent } from './engines/PortalAgent';
import { ResearchAgent } from './engines/ResearchAgent';
import { VaultAgent } from './engines/VaultAgent';
import { VoiceAgent } from './engines/VoiceAgent';

// Systems (Additional Engines)
export { MapsEngine } from './systems/MapsEngine';
export { FinancialEngine } from './systems/FinancialEngine';
export { CarPlayEngine } from './systems/CarPlayEngine';
export { WeatherEngine } from './systems/WeatherEngine';
export { SOSEngine } from './systems/SOSEngine';
export { ThemeEngine } from './systems/ThemeEngine';
export { TranslationEngine } from './systems/TranslationEngine';
export { PaymentEngine } from './systems/PaymentEngine';

// Import Systems for initialization
import { MapsEngine } from './systems/MapsEngine';
import { FinancialEngine } from './systems/FinancialEngine';
import { CarPlayEngine } from './systems/CarPlayEngine';
import { WeatherEngine } from './systems/WeatherEngine';
import { SOSEngine } from './systems/SOSEngine';
import { ThemeEngine } from './systems/ThemeEngine';
import { TranslationEngine } from './systems/TranslationEngine';
import { PaymentEngine } from './systems/PaymentEngine';

/**
 * Initialize ABO ZIEN System
 * تهيئة النظام الكامل
 */
export async function initializeAboZien() {
  // 1. Initialize Mobile Kernel
  const kernel = RAREKernel.getInstance();
  await kernel.init();

  // 2. Initialize Cognitive Loop
  const cognitiveLoop = CognitiveLoop.getInstance();
  await cognitiveLoop.init(kernel);

  // 3. Initialize Backend Kernel (if needed)
  // const backendKernel = BackendRAREKernel.instance;

  // 4. Register all Engines
  const engines = [
    new AIEngine(),
    new VoiceAgent(),
    new BuilderAgent(),
    new FilingAgent(),
    new VaultAgent(),
    new PortalAgent(),
    new LoyaltyAgent(),
    new ResearchAgent(),
  ];

  // 5. Register all Systems
  const systems = [
    new MapsEngine(),
    new FinancialEngine(),
    new CarPlayEngine(),
    new WeatherEngine(),
    new SOSEngine(),
    new ThemeEngine(),
    new TranslationEngine(),
    new PaymentEngine(),
  ];

  systems.forEach(system => {
    kernel.registerEngine(system);
  });

  engines.forEach(engine => {
    kernel.registerEngine(engine);
  });

  // 6. Initialize Visual Presence
  const visualPresence = VisualPresence.getInstance();
  await visualPresence.init(kernel);

  // 7. Initialize Ambient Awareness
  const ambientAwareness = AmbientAwareness.getInstance();
  await ambientAwareness.init(kernel);

  // 8. Start Kernel
  await kernel.start();

  return {
    kernel,
    cognitiveLoop,
    engines,
    systems,
    visualPresence,
    ambientAwareness,
  };
}

