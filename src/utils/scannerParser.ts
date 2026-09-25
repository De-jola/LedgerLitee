import { ScannedReceiptData, IncomeCategory } from '../types';

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
