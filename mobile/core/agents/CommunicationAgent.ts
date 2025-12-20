/**
 * CommunicationAgent - وكيل التواصل
 * يدير Phone Calls, Email, WhatsApp, SMS
 * Ultimate Assistant - مخلص للمستخدم والعائلة
 */

import { BaseAgent } from './BaseAgent';
import * as Linking from 'expo-linking';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

// Family members data
const FAMILY_MEMBERS = {
  NADER: { name: 'نادر', phone: '+971529211077', email: 'GM@ZIEN-AI.APP', whatsapp: '+971529211077' },
  OMY: { name: 'أمي', phone: '', email: '', whatsapp: '' },
  NARIMAN: { name: 'ناريمان', phone: '', email: '', whatsapp: '' },
  NADA: { name: 'ندى', phone: '', email: '', whatsapp: '' },
  ZIEN: { name: 'زيان', phone: '', email: '', whatsapp: '' },
  TAMARA: { name: 'تمارا', phone: '', email: '', whatsapp: '' },
  OMAR: { name: 'عمر', phone: '', email: '', whatsapp: '' },
  KAYAN: { name: 'كيان', phone: '', email: '', whatsapp: '' },
};

export class CommunicationAgent extends BaseAgent {
  constructor() {
    super({
      id: 'communication',
      name: 'Communication Agent',
      description: 'Ultimate Assistant - Phone, Email, WhatsApp, SMS',
      capabilities: [
        'make_phone_call',
        'send_email',
        'send_whatsapp',
        'send_sms',
        'contact_family_member',
        'ultimate_assistant',
      ],
    });
  }

  protected async onExecuteAction(action: string, parameters: any): Promise<any> {
    switch (action) {
      case 'make_phone_call':
        return await this.makePhoneCall(parameters);

      case 'send_email':
        return await this.sendEmail(parameters);

      case 'send_whatsapp':
        return await this.sendWhatsApp(parameters);

      case 'send_sms':
        return await this.sendSMS(parameters);

      case 'contact_family_member':
        return await this.contactFamilyMember(parameters);

      case 'ultimate_assistant':
        return await this.ultimateAssistant(parameters);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  /**
   * Make phone call
   */
  private async makePhoneCall(parameters: any): Promise<any> {
    const { phone, message } = parameters;

    if (!phone) {
      throw new Error('Phone number is required');
    }

    try {
      // Method 1: Use backend API (Twilio)
      if (message) {
        const response = await fetch(`${API_URL}/api/communication/call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: phone, message }),
        });

        const json = await response.json();
        
        if (json.success) {
          this.emit('agent:communication:response', { 
            type: 'phone_call', 
            success: true,
            callSid: json.callSid,
          });
          return json;
        }
      }

      // Method 2: Open native phone dialer
      const phoneUrl = `tel:${phone}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
        this.emit('agent:communication:response', { 
          type: 'phone_call', 
          success: true,
          method: 'native_dialer',
        });
        return { success: true, method: 'native_dialer' };
      }

      throw new Error('Cannot open phone dialer');
    } catch (error) {
      this.emit('agent:communication:error', { error: String(error) });
      throw error;
    }
  }

  /**
   * Send email
   */
  private async sendEmail(parameters: any): Promise<any> {
    const { to, subject, text, html, attachments } = parameters;

    if (!to) {
      throw new Error('Email address is required');
    }

    try {
      const response = await fetch(`${API_URL}/api/communication/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text, html, attachments }),
      });

      const json = await response.json();
      
      if (json.success) {
        this.emit('agent:communication:response', { 
          type: 'email', 
          success: true,
          messageId: json.messageId,
        });
        return json;
      } else {
        throw new Error(json.error || 'Failed to send email');
      }
    } catch (error) {
      this.emit('agent:communication:error', { error: String(error) });
      throw error;
    }
  }

  /**
   * Send WhatsApp message
   */
  private async sendWhatsApp(parameters: any): Promise<any> {
    const { phone, message, mediaUrl } = parameters;

    if (!phone || !message) {
      throw new Error('Phone number and message are required');
    }

    try {
      // Method 1: Use backend API (WhatsApp Business API or Twilio)
      const response = await fetch(`${API_URL}/api/communication/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message, mediaUrl }),
      });

      const json = await response.json();
      
      if (json.success) {
        this.emit('agent:communication:response', { 
          type: 'whatsapp', 
          success: true,
          messageId: json.messageId || json.messageSid,
        });
        return json;
      }

      // Method 2: Open WhatsApp with pre-filled message
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        this.emit('agent:communication:response', { 
          type: 'whatsapp', 
          success: true,
          method: 'native_whatsapp',
        });
        return { success: true, method: 'native_whatsapp' };
      }

      throw new Error('Cannot open WhatsApp');
    } catch (error) {
      this.emit('agent:communication:error', { error: String(error) });
      throw error;
    }
  }

  /**
   * Send SMS
   */
  private async sendSMS(parameters: any): Promise<any> {
    const { phone, message } = parameters;

    if (!phone || !message) {
      throw new Error('Phone number and message are required');
    }

    try {
      // Method 1: Use backend API (Twilio)
      const response = await fetch(`${API_URL}/api/communication/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message }),
      });

      const json = await response.json();
      
      if (json.success) {
        this.emit('agent:communication:response', { 
          type: 'sms', 
          success: true,
          messageSid: json.messageSid,
        });
        return json;
      }

      // Method 2: Open native SMS app
      const smsUrl = `sms:${phone}?body=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(smsUrl);
      
      if (canOpen) {
        await Linking.openURL(smsUrl);
        this.emit('agent:communication:response', { 
          type: 'sms', 
          success: true,
          method: 'native_sms',
        });
        return { success: true, method: 'native_sms' };
      }

      throw new Error('Cannot open SMS app');
    } catch (error) {
      this.emit('agent:communication:error', { error: String(error) });
      throw error;
    }
  }

  /**
   * Contact family member
   */
  private async contactFamilyMember(parameters: any): Promise<any> {
    const { member, method, message } = parameters;

    if (!member) {
      throw new Error('Family member name is required');
    }

    const memberData = FAMILY_MEMBERS[member.toUpperCase() as keyof typeof FAMILY_MEMBERS];
    if (!memberData) {
      throw new Error(`Family member ${member} not found`);
    }

    const methodLower = (method || 'whatsapp').toLowerCase();

    try {
      switch (methodLower) {
        case 'phone':
        case 'call':
          if (!memberData.phone) {
            throw new Error(`Phone number not available for ${memberData.name}`);
          }
          return await this.makePhoneCall({ phone: memberData.phone, message });

        case 'whatsapp':
        case 'wa':
          if (!memberData.whatsapp) {
            throw new Error(`WhatsApp number not available for ${memberData.name}`);
          }
          return await this.sendWhatsApp({ 
            phone: memberData.whatsapp, 
            message: message || `مرحباً ${memberData.name}، هذا RARE المساعد الشخصي. كيف يمكنني مساعدتك؟`,
          });

        case 'email':
          if (!memberData.email) {
            throw new Error(`Email not available for ${memberData.name}`);
          }
          return await this.sendEmail({ 
            to: memberData.email, 
            subject: 'من RARE 4N',
            text: message || `مرحباً ${memberData.name}، هذا RARE المساعد الشخصي.`,
          });

        case 'sms':
          if (!memberData.phone) {
            throw new Error(`Phone number not available for ${memberData.name}`);
          }
          return await this.sendSMS({ 
            phone: memberData.phone, 
            message: message || `مرحباً ${memberData.name}، هذا RARE المساعد الشخصي.`,
          });

        default:
          throw new Error(`Unknown communication method: ${method}`);
      }
    } catch (error) {
      this.emit('agent:communication:error', { error: String(error) });
      throw error;
    }
  }

  /**
   * Ultimate Assistant - All-in-one communication
   */
  private async ultimateAssistant(parameters: any): Promise<any> {
    const { action, type, to, message, subject, html, attachments, mediaUrl, familyMember } = parameters;

    try {
      // If family member specified, use family contact
      if (familyMember) {
        return await this.contactFamilyMember({
          member: familyMember,
          method: type || 'whatsapp',
          message,
        });
      }

      // Otherwise, use ultimate communication endpoint
      const response = await fetch(`${API_URL}/api/communication/ultimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          type,
          to,
          message,
          subject,
          html,
          attachments,
          mediaUrl,
        }),
      });

      const json = await response.json();
      
      if (json.success) {
        this.emit('agent:communication:response', { 
          type: 'ultimate', 
          success: true,
          ...json,
        });
        return json;
      } else {
        throw new Error(json.error || 'Failed to communicate');
      }
    } catch (error) {
      this.emit('agent:communication:error', { error: String(error) });
      throw error;
    }
  }
}

