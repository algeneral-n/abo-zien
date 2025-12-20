/**
 * Terminal Integration Service
 * ?????? Terminal ???? ???????? ??????????????: Widget, Client Portal, Twilio, Email, Phone, Auto Filing, Images, Videos
 */

import { RAREKernel } from '../RAREKernel';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export class TerminalIntegrationService {
  private kernel: RAREKernel;

  constructor() {
    this.kernel = RAREKernel.getInstance();
  }

  /**
   * ?????????? ?????????? ???????????? ?????? Widget
   */
  async notifyClientViaWidget(clientId: string, message: string, data?: any): Promise<void> {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:notifyClientViaWidget',message:'Notifying client via Widget',data:{clientId,hasMessage:!!message},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'WIDGET_NOTIFY_START'})}).catch(()=>{});
      }

      // ?????????? ?????? Kernel ??? PortalAgent
      this.kernel.emit({
        type: 'agent:portal:execute',
        data: {
          action: 'send_widget_notification',
          parameters: {
            clientId,
            message,
            data,
          },
        },
      });

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:notifyClientViaWidget',message:'Widget notification sent',data:{clientId},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'WIDGET_NOTIFY_SUCCESS'})}).catch(()=>{});
      }
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:notifyClientViaWidget',message:'Widget notification error',data:{error:error.message,clientId},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'WIDGET_NOTIFY_ERROR'})}).catch(()=>{});
      }
      console.error('[TerminalIntegration] Widget notification error:', error);
      throw error;
    }
  }

  /**
   * ?????????? ?????????? WhatsApp ?????? Twilio
   */
  async sendWhatsApp(phone: string, message: string, template?: string): Promise<void> {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:sendWhatsApp',message:'Sending WhatsApp',data:{phone,hasTemplate:!!template},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'WHATSAPP_SEND_START'})}).catch(()=>{});
      }

      // ?????????? ?????? Kernel ??? CommunicationAgent
      this.kernel.emit({
        type: 'agent:communication:execute',
        data: {
          action: 'send_whatsapp',
          parameters: {
            phone,
            message,
            template,
          },
        },
      });

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:sendWhatsApp',message:'WhatsApp sent',data:{phone},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'WHATSAPP_SEND_SUCCESS'})}).catch(()=>{});
      }
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:sendWhatsApp',message:'WhatsApp send error',data:{error:error.message,phone},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'WHATSAPP_SEND_ERROR'})}).catch(()=>{});
      }
      console.error('[TerminalIntegration] WhatsApp send error:', error);
      throw error;
    }
  }

  /**
   * ?????????? Email
   */
  async sendEmail(to: string, subject: string, body: string, attachments?: any[]): Promise<void> {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:sendEmail',message:'Sending email',data:{to,subject,hasAttachments:!!attachments},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'EMAIL_SEND_START'})}).catch(()=>{});
      }

      // ?????????? ?????? Kernel ??? CommunicationAgent
      this.kernel.emit({
        type: 'agent:communication:execute',
        data: {
          action: 'send_email',
          parameters: {
            to,
            subject,
            body,
            attachments,
          },
        },
      });

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:sendEmail',message:'Email sent',data:{to},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'EMAIL_SEND_SUCCESS'})}).catch(()=>{});
      }
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:sendEmail',message:'Email send error',data:{error:error.message,to},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'EMAIL_SEND_ERROR'})}).catch(()=>{});
      }
      console.error('[TerminalIntegration] Email send error:', error);
      throw error;
    }
  }

  /**
   * ?????????? SMS ?????? Twilio
   */
  async sendSMS(phone: string, message: string): Promise<void> {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:sendSMS',message:'Sending SMS',data:{phone},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'SMS_SEND_START'})}).catch(()=>{});
      }

      // ?????????? ?????? Kernel ??? CommunicationAgent
      this.kernel.emit({
        type: 'agent:communication:execute',
        data: {
          action: 'send_sms',
          parameters: {
            phone,
            message,
          },
        },
      });

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:sendSMS',message:'SMS sent',data:{phone},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'SMS_SEND_SUCCESS'})}).catch(()=>{});
      }
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:sendSMS',message:'SMS send error',data:{error:error.message,phone},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'SMS_SEND_ERROR'})}).catch(()=>{});
      }
      console.error('[TerminalIntegration] SMS send error:', error);
      throw error;
    }
  }

  /**
   * ?????????? ???????????? ????????????
   */
  async makePhoneCall(phone: string): Promise<void> {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:makePhoneCall',message:'Making phone call',data:{phone},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'PHONE_CALL_START'})}).catch(()=>{});
      }

      // ?????????? ?????? Kernel ??? CommunicationAgent
      this.kernel.emit({
        type: 'agent:communication:execute',
        data: {
          action: 'make_phone_call',
          parameters: {
            phone,
          },
        },
      });

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:makePhoneCall',message:'Phone call initiated',data:{phone},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'PHONE_CALL_SUCCESS'})}).catch(()=>{});
      }
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:makePhoneCall',message:'Phone call error',data:{error:error.message,phone},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'PHONE_CALL_ERROR'})}).catch(()=>{});
      }
      console.error('[TerminalIntegration] Phone call error:', error);
      throw error;
    }
  }

  /**
   * ?????????? ???????? Client Portal
   */
  async generateClientPortalLink(clientId: string, requestId?: string): Promise<string> {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:generateClientPortalLink',message:'Generating portal link',data:{clientId,requestId},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'PORTAL_LINK_START'})}).catch(()=>{});
      }

      // ?????????? ?????? Kernel ??? PortalAgent
      const response = await fetch(`${API_URL}/api/client-portal/generate-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, requestId }),
      });

      const data = await response.json();

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:generateClientPortalLink',message:'Portal link generated',data:{clientId,hasLink:!!data.link},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'PORTAL_LINK_SUCCESS'})}).catch(()=>{});
      }

      return data.link || '';
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:generateClientPortalLink',message:'Portal link error',data:{error:error.message,clientId},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'PORTAL_LINK_ERROR'})}).catch(()=>{});
      }
      console.error('[TerminalIntegration] Portal link error:', error);
      throw error;
    }
  }

  /**
   * ?????????? ????????
   */
  async generateImage(prompt: string, style?: string): Promise<string> {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:generateImage',message:'Generating image',data:{prompt,style},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'IMAGE_GENERATE_START'})}).catch(()=>{});
      }

      // ?????????? ?????? Kernel ??? FilingAgent
      this.kernel.emit({
        type: 'agent:filing:execute',
        data: {
          action: 'generate_image',
          parameters: {
            prompt,
            style,
          },
        },
      });

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:generateImage',message:'Image generation initiated',data:{prompt},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'IMAGE_GENERATE_SUCCESS'})}).catch(()=>{});
      }

      return 'Image generation started';
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:generateImage',message:'Image generation error',data:{error:error.message,prompt},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'IMAGE_GENERATE_ERROR'})}).catch(()=>{});
      }
      console.error('[TerminalIntegration] Image generation error:', error);
      throw error;
    }
  }

  /**
   * ?????????? ??????????
   */
  async generateVideo(prompt: string, duration?: number): Promise<string> {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:generateVideo',message:'Generating video',data:{prompt,duration},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'VIDEO_GENERATE_START'})}).catch(()=>{});
      }

      // ?????????? ?????? Kernel ??? FilingAgent
      this.kernel.emit({
        type: 'agent:filing:execute',
        data: {
          action: 'generate_video',
          parameters: {
            prompt,
            duration,
          },
        },
      });

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:generateVideo',message:'Video generation initiated',data:{prompt},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'VIDEO_GENERATE_SUCCESS'})}).catch(()=>{});
      }

      return 'Video generation started';
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:generateVideo',message:'Video generation error',data:{error:error.message,prompt},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'VIDEO_GENERATE_ERROR'})}).catch(()=>{});
      }
      console.error('[TerminalIntegration] Video generation error:', error);
      throw error;
    }
  }

  /**
   * ?????????? ?????? ????????????????
   */
  async generateFile(type: string, content: string, filename?: string): Promise<string> {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:generateFile',message:'Generating file',data:{type,filename},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'FILE_GENERATE_START'})}).catch(()=>{});
      }

      // ?????????? ?????? Kernel ??? FilingAgent
      this.kernel.emit({
        type: 'agent:filing:execute',
        data: {
          action: 'generate_file',
          parameters: {
            type,
            content,
            filename,
          },
        },
      });

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:generateFile',message:'File generation initiated',data:{type,filename},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'FILE_GENERATE_SUCCESS'})}).catch(()=>{});
      }

      return 'File generation started';
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:generateFile',message:'File generation error',data:{error:error.message,type},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'FILE_GENERATE_ERROR'})}).catch(()=>{});
      }
      console.error('[TerminalIntegration] File generation error:', error);
      throw error;
    }
  }

  /**
   * ?????????? ?????????? ???????? ???????????? (Widget + WhatsApp + Email)
   */
  async notifyClientComprehensive(clientId: string, clientPhone: string, clientEmail: string, message: string, buildLink?: string): Promise<void> {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:notifyClientComprehensive',message:'Comprehensive client notification started',data:{clientId,hasBuildLink:!!buildLink},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'COMPREHENSIVE_NOTIFY_START'})}).catch(()=>{});
      }

      // Widget
      await this.notifyClientViaWidget(clientId, message, { buildLink });

      // WhatsApp
      if (clientPhone) {
        await this.sendWhatsApp(clientPhone, message, 'build_completion');
      }

      // Email
      if (clientEmail) {
        await this.sendEmail(
          clientEmail,
          '???? ?????????? ???????? ??????????????',
          `${message}\n\n${buildLink ? `???????? ??????????????: ${buildLink}` : ''}`,
        );
      }

      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:notifyClientComprehensive',message:'Comprehensive notification completed',data:{clientId},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'COMPREHENSIVE_NOTIFY_SUCCESS'})}).catch(()=>{});
      }
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/services/TerminalIntegrationService.ts:notifyClientComprehensive',message:'Comprehensive notification error',data:{error:error.message,clientId},timestamp:Date.now(),sessionId:'terminal-integration-session',runId:'run1',hypothesisId:'COMPREHENSIVE_NOTIFY_ERROR'})}).catch(()=>{});
      }
      console.error('[TerminalIntegration] Comprehensive notification error:', error);
      throw error;
    }
  }
}



