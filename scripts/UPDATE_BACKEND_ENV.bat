@echo off
REM ========================================
REM   Update Backend .env with EAS Secrets
REM   ?????????? Backend .env ?????????????????? ???? EAS Secrets
REM ========================================

cd /d "%~dp0\backend"

echo.
echo ========================================
echo   Updating Backend .env
echo   ?????????? Backend .env
echo ========================================
echo.

echo Adding API keys from EAS Secrets...
echo.

REM Append API keys to .env file
(
echo.
echo # ========================================
echo # API Keys from EAS Secrets
echo # ========================================
echo.
echo # AI Services
echo OPENAI_KEY=REPLACE_ME
echo ANTHROPIC_KEY=REPLACE_ME
echo CLAUDE_API_KEY=REMOVED-api03-Pej3GL1bSTOLFJnXdk29kSn_I0b1avV7SxDUpQXJA8fNxGsxaLKTEXqzzd9c_qkz-8O-Dujgv2_7_yAa14LLpg-7pIVaQAA
echo GEMINI_API_KEY=AIzaSyCDAVvQTbXwUDnmP2FBTaeei6Ru47xrILk
echo.
echo # Maps
echo GOOGLE_MAPS_API_KEY=AIzaSyD_972sZ4Vx0n0DQL_DUcZpu2QZKmTcLGA
echo APPLE_KEY=REPLACE_ME
echo.
echo # Weather
echo APPLE_KEY=REPLACE_ME
echo APPLE_KEY=REPLACE_ME
echo APPLE_KEY=REPLACE_ME
echo APPLE_KEY=REPLACE_ME
echo.
echo # Voice - ElevenLabs
echo ELEVENLABS_KEY=REPLACE_ME
echo ELEVENLABS_KEY=REPLACE_ME
echo ELEVENLABS_KEY=REPLACE_ME
echo ELEVENLABS_KEY=REPLACE_ME
echo ELEVENLABS_KEY=REPLACE_ME
echo ELEVENLABS_KEY=REPLACE_ME
echo ELEVENLABS_KEY=REPLACE_ME
echo ELEVENLABS_KEY=REPLACE_ME
echo ELEVENLABS_KEY=REPLACE_ME
echo ELEVENLABS_KEY=REPLACE_ME
echo system_agent_ID=9401kb2n0gf5e2wtp4sfs8chdmk1
echo.
echo # Voice Configuration
echo TTS_ENGINE=elevenlabs
echo TTS_VOICE_MODEL=eleven_multilingual_v2
echo TTS_SPEED=1.0
echo TTS_PITCH=1.0
echo.
echo # Payments
echo STRIPE_KEY=REPLACE_ME
echo STRIPE_KEY=REPLACE_ME
echo.
echo # Google OAuth
echo GOOGLE_CLIENT_ID=sh9q3pki39sh8blu13ga67e26kq6243d.apps.googleusercontent.com
echo GOOGLE_CLIENT_SECRET=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
echo.
echo # Google Vision API (for OCR)
echo GOOGLE_VISION_API_KEY=AIzaSyDOqNOXByvTkYPDItw8wbIF-exEdUkleAk
echo.
echo # Apple Services
echo AASC_API_KEY_ID=J9SSR3CD83
echo ASC_API_KEY_ISSUER_ID=d790aa1b-f46a-46dc-8187-b94b5e372c16
echo.
echo # Video Generation (Optional - has fallback)
echo # RUNWAY_API_KEY=your_runway_api_key_here
echo # PIKA_API_KEY=your_pika_api_key_here
echo.
echo # SMS/Phone/WhatsApp (Optional - Email works as fallback)
echo # Twilio Live Credentials (Production)
echo TWILIO_KEY=REPLACE_ME
echo TWILIO_KEY=REPLACE_ME
echo.
echo # Twilio Test Credentials (Testing - Optional)
echo TWILIO_KEY=REPLACE_ME
echo TWILIO_KEY=REPLACE_ME
echo.
echo # WhatsApp Sandbox
echo TWILIO_KEY=REPLACE_ME
echo # Sandbox Phone: +1 415 523 8886
echo # Join Code: join court-manufacturing
echo # Note: For WhatsApp, use format: whatsapp:+1234567890
echo.
echo # Twilio Verify Service (OTP)
echo TWILIO_KEY=REPLACE_ME
echo.
echo # Security
echo RARE_JWT_SECRET=91d517e555899ffc9ffc11ad11ad70743
echo RARE_MASTER_KEY=ea1f1612-11ad-4a05-a7a3-d96254db6df1
echo RARE_ENCRYPTION_SALT=d96254db6df1a4f3e4c71066dbdf
echo.
echo # Server
echo PORT=5000
echo NODE_ENV=production
echo API_DOMAIN=https://api.zien-ai.app
echo ALLOWED_ORIGINS=https://api.zien-ai.app,http://localhost:5000,exp://localhost:8081,http://localhost:19006
) >> .env

echo.
echo ??? API keys added to backend/.env
echo.
echo To verify:
echo   Get-Content backend\.env | Select-String "OPENAI_KEY=REPLACE_ME
echo.
pause



