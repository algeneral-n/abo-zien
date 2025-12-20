/**
 * ABO ZIEN - Financial Engine
 * Accounting, Invoicing, Tax, VAT, Ledger, Journal
 */

import { RAREEngine, EngineConfig } from '../core/RAREEngine';
import { RAREKernel } from '../core/RAREKernel';

export interface Invoice {
  id: string;
  clientName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
  dueDate?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  account: string;
  category: string;
}

export interface TaxReport {
  totalRevenue: number;
  totalVAT: number;
  vatRate: number;
  invoiceCount: number;
  period: {
    start: string;
    end: string;
  };
}

export class FinancialEngine extends RAREEngine {
  readonly id = 'financial-engine';
  readonly name = 'Financial Engine';
  readonly version = '1.0.0';

  protected kernel: RAREKernel | null = null;
  protected initialized: boolean = false;
  protected running: boolean = false;

  private apiBase: string;

  async initialize(config: EngineConfig): Promise<void> {
    this.kernel = config.kernel;
    this.initialized = true;

    this.apiBase = config.apiBase || process.env.API_URL || 'http://localhost:5000/api';

    // Subscribe to Cognitive Loop commands
    if (this.kernel) {
      this.kernel.on('agent:financial:execute', (event) => {
        this.handleCognitiveCommand(event.data);
      });
    }
  }

  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Financial Engine not initialized');
    }
    this.running = true;
    this.emit('financial:started', {});
  }

  async stop(): Promise<void> {
    this.running = false;
    this.emit('financial:stopped', {});
  }

  /**
   * Handle command from Cognitive Loop
   */
  private async handleCognitiveCommand(command: any): Promise<void> {
    switch (command.action) {
      case 'create_invoice':
        await this.createInvoice(command.parameters);
        break;
      case 'get_invoices':
        await this.getInvoices(command.parameters);
        break;
      case 'calculate_vat':
        await this.calculateVAT(command.parameters);
        break;
      case 'get_tax_report':
        await this.getTaxReport(command.parameters);
        break;
      case 'add_journal_entry':
        await this.addJournalEntry(command.parameters);
        break;
      case 'get_ledger':
        await this.getLedger(command.parameters);
        break;
    }
  }

  /**
   * Create invoice
   */
  private async createInvoice(parameters: any): Promise<void> {
    try {
      const { clientName, items, tax = 15, currency = 'SAR' } = parameters;

      const response = await fetch(`${this.apiBase}/rare4n/finance/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, items, tax, currency }),
      });

      const data = await response.json();

      this.emit('financial:invoice_created', {
        invoice: data.invoice,
      });
    } catch (error: any) {
      this.emit('financial:error', { error: error.message, action: 'create_invoice' });
    }
  }

  /**
   * Get invoices
   */
  private async getInvoices(parameters: any): Promise<void> {
    try {
      const { status } = parameters || {};

      const url = status
        ? `${this.apiBase}/rare4n/finance/invoices?status=${status}`
        : `${this.apiBase}/rare4n/finance/invoices`;

      const response = await fetch(url);
      const data = await response.json();

      this.emit('financial:invoices_listed', {
        invoices: data.invoices,
        count: data.count,
      });
    } catch (error: any) {
      this.emit('financial:error', { error: error.message, action: 'get_invoices' });
    }
  }

  /**
   * Calculate VAT
   */
  private async calculateVAT(parameters: any): Promise<void> {
    try {
      const { amount, rate = 15 } = parameters;

      const response = await fetch(`${this.apiBase}/rare4n/finance/vat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, rate }),
      });

      const data = await response.json();

      this.emit('financial:vat_calculated', {
        result: data.result,
      });
    } catch (error: any) {
      this.emit('financial:error', { error: error.message, action: 'calculate_vat' });
    }
  }

  /**
   * Get tax report
   */
  private async getTaxReport(parameters: any): Promise<void> {
    try {
      const response = await fetch(`${this.apiBase}/rare4n/finance/tax-report`);
      const data = await response.json();

      this.emit('financial:tax_report', {
        report: data.taxReport,
      });
    } catch (error: any) {
      this.emit('financial:error', { error: error.message, action: 'get_tax_report' });
    }
  }

  /**
   * Add journal entry
   */
  private async addJournalEntry(parameters: any): Promise<void> {
    try {
      const { date, description, debit, credit, account, category } = parameters;

      // This would typically call a backend API
      const entry: JournalEntry = {
        id: `journal_${Date.now()}`,
        date: date || new Date().toISOString(),
        description,
        debit,
        credit,
        account,
        category,
      };

      this.emit('financial:journal_entry_added', {
        entry,
      });
    } catch (error: any) {
      this.emit('financial:error', { error: error.message, action: 'add_journal_entry' });
    }
  }

  /**
   * Get ledger
   */
  private async getLedger(parameters: any): Promise<void> {
    try {
      const { account, startDate, endDate } = parameters || {};

      // This would typically call a backend API
      const entries: JournalEntry[] = []; // Would be fetched from backend

      this.emit('financial:ledger', {
        entries,
        account,
        period: { start: startDate, end: endDate },
      });
    } catch (error: any) {
      this.emit('financial:error', { error: error.message, action: 'get_ledger' });
    }
  }
}

