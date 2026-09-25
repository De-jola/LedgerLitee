import { ScannedReceiptData, PaymentMethod, IncomeCategory } from '../types';

export function parseReceiptCode(rawCode: string): ScannedReceiptData {
  const trimmed = rawCode.trim();

  const result: ScannedReceiptData = {
    rawPayload: trimmed,
    verified: true,
  } as ScannedReceiptData;

  // 1. Check for JSON format
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      result.receiptNumber = parsed.receipt || parsed.ref || parsed.id || parsed.referenceNumber;
      result.amount = Number(parsed.amt || parsed.amount || 0);
      result.payerName = parsed.payer || parsed.name || parsed.student || parsed.payerName;
      result.posAgentName = parsed.pos || parsed.agent || parsed.posAgentName;
      result.paymentMethod = parsed.method || (parsed.pos ? 'pos_agent' : 'cash');
      result.category = parsed.category || 'tuition_fees';
      result.notes = parsed.notes || `Scanned from digital receipt QR (${result.receiptNumber || 'Ref'})`;
      result.date = parsed.date || new Date().toISOString().split('T')[0];
      return result;
    } catch {
      // Continue to next parsers
    }
  }

  // 2. Check for pipe-delimited format: KT-REC-001|35000|Amina Musa|POS-REF-992|tuition_fees
  if (trimmed.includes('|')) {
    const parts = trimmed.split('|').map(p => p.trim());
    result.receiptNumber = parts[0];
    
    // Amount usually in 2nd slot
    const possibleAmount = parseFloat(parts[1]?.replace(/[^0-9.]/g, ''));
    if (!isNaN(possibleAmount) && possibleAmount > 0) {
      result.amount = possibleAmount;
    }

    if (parts[2]) {
      result.payerName = parts[2];
    }
    if (parts[3]) {
      result.posAgentName = parts[3];
      result.paymentMethod = 'pos_agent';
    } else {
      result.paymentMethod = 'cash';
    }
    if (parts[4]) {
      result.category = parts[4] as IncomeCategory;
    } else {
      result.category = 'tuition_fees';
    }
    result.notes = `Scanned receipt barcode. Verified reference: ${result.receiptNumber}`;
    result.date = new Date().toISOString().split('T')[0];
    return result;
  }

  // 3. Check for standard POS terminal slip text or RRN/STAN
  // Example: "STAN: 920194 | AMT: 35000 | RRN: 88192039 | MONIEPOINT"
  const amountMatch = trimmed.match(/(?:AMT|AMOUNT|TOTAL|₦|NGN|KSH|GHS|\$)\s*[:=]?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
  if (amountMatch) {
    const amtStr = amountMatch[1].replace(/,/g, '');
    result.amount = parseFloat(amtStr);
  }

  const rrnMatch = trimmed.match(/(?:RRN|STAN|REF|RECEIPT|TXN)\s*[:#=]?\s*([A-Za-z0-9_-]{5,25})/i);
  if (rrnMatch) {
    result.receiptNumber = rrnMatch[1];
  } else {
    result.receiptNumber = trimmed.slice(0, 30);
  }

  // Check agent hints
  if (/moniepoint/i.test(trimmed)) {
    result.posAgentName = 'Moniepoint POS Agent';
    result.paymentMethod = 'pos_agent';
  } else if (/opay/i.test(trimmed)) {
    result.posAgentName = 'OPay POS Agent';
    result.paymentMethod = 'pos_agent';
  } else if (/palmpay/i.test(trimmed)) {
    result.posAgentName = 'PalmPay POS Agent';
    result.paymentMethod = 'pos_agent';
  } else if (/firstmonie/i.test(trimmed)) {
    result.posAgentName = 'Firstmonie POS Agent';
    result.paymentMethod = 'pos_agent';
  } else {
    result.paymentMethod = 'cash';
  }

  // Default fallbacks
  result.category = 'tuition_fees';
  result.date = new Date().toISOString().split('T')[0];
  result.notes = `Barcode scanned: ${trimmed}`;

  return result;
}

// Sample test receipts that can be rendered or scanned
export interface SampleReceipt {
  id: string;
  studentName: string;
  studentClass: string;
  amount: number;
  paymentType: PaymentMethod;
  posAgent: string;
  receiptNumber: string;
  purpose: string;
  qrPayload: string;
}

export const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    id: 'DEMO-1',
    studentName: 'Chidera Obi',
    studentClass: 'Primary 2 B',
    amount: 32500,
    paymentType: 'pos_agent',
    posAgent: 'Moniepoint Agent (Shop 4)',
    receiptNumber: 'POS-MP-2026-9041',
    purpose: 'Tuition Fees & Examination Booklet',
    qrPayload: 'KT-REC-9041|32500|Chidera Obi (Primary 2B)|POS-MP-2026-9041|tuition_fees',
  },
  {
    id: 'DEMO-2',
    studentName: 'Fatima Abubakar',
    studentClass: 'Nursery 2',
    amount: 25000,
    paymentType: 'pos_agent',
    posAgent: 'OPay Agent (Market Square)',
    receiptNumber: 'OPY-SLIP-77312',
    purpose: 'Term 1 School Fees',
    qrPayload: 'KT-REC-77312|25000|Fatima Abubakar (Nursery 2)|OPY-SLIP-77312|tuition_fees',
  },
  {
    id: 'DEMO-3',
    studentName: 'Samuel Adeleke',
    studentClass: 'Basic 5',
    amount: 18000,
    paymentType: 'cash',
    posAgent: 'Direct Cash to Bursar',
    receiptNumber: 'CASH-SLIP-0881',
    purpose: 'PTA Levy & School Uniform Set',
    qrPayload: 'KT-REC-0881|18000|Samuel Adeleke (Basic 5)|CASH-SLIP-0881|pta_levy',
  },
  {
    id: 'DEMO-4',
    studentName: 'Kalu Chukwudi',
    studentClass: 'JSS 1 / Upper Primary',
    amount: 45000,
    paymentType: 'pos_agent',
    posAgent: 'PalmPay POS Point',
    receiptNumber: 'PLM-TX-55102',
    purpose: 'New Student Admission & Registration',
    qrPayload: 'KT-REC-55102|45000|Kalu Chukwudi (JSS 1)|PLM-TX-55102|registration_admission',
  }
];
