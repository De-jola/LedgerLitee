/**
 * LedgerLite Print Utility
 * Provides reliable printing of receipts, invoices, and payment slips
 * across desktop, mobile, and iframe preview environments without backdrop clipping.
 */

export function printElement(element: HTMLElement | null, documentTitle: string = 'LedgerLite Document') {
  if (!element) {
    window.print();
    return;
  }

  try {
    // Create an isolated hidden iframe for printing
    const iframeId = 'ledgerlite-print-frame';
    let printFrame = document.getElementById(iframeId) as HTMLIFrameElement;
    if (printFrame) {
      document.body.removeChild(printFrame);
    }

    printFrame = document.createElement('iframe');
    printFrame.id = iframeId;
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.visibility = 'hidden';

    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (!frameDoc || !printFrame.contentWindow) {
      window.print();
      return;
    }

    // Clone element to prevent modifying current DOM
    const clone = element.cloneNode(true) as HTMLElement;

    // Collect all stylesheets from current document
    let stylesHtml = '';
    const styleSheets = document.querySelectorAll('style, link[rel="stylesheet"]');
    styleSheets.forEach((sheet) => {
      stylesHtml += sheet.outerHTML;
    });

    // Write pristine print document
    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>${documentTitle}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          ${stylesHtml}
          <style>
            @page {
              size: auto;
              margin: 12mm;
            }
            body {
              background-color: #ffffff !important;
              color: #0f172a !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              padding: 0 !important;
              margin: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print\\:hidden, button, [role="button"] {
              display: none !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-shadow: none !important;
            }
            img {
              max-width: 100% !important;
            }
          </style>
        </head>
        <body class="bg-white text-slate-900 p-4">
          <div id="print-wrapper" class="w-full max-w-3xl mx-auto">
            ${clone.outerHTML}
          </div>
        </body>
      </html>
    `);
    frameDoc.close();

    // Trigger printing once loaded
    printFrame.contentWindow.focus();

    // Allow resources & images to settle before triggering print dialog
    setTimeout(() => {
      try {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window.print', err);
        window.print();
      } finally {
        // Clean up iframe after a delay
        setTimeout(() => {
          if (printFrame && printFrame.parentNode) {
            printFrame.parentNode.removeChild(printFrame);
          }
        }, 3000);
      }
    }, 250);
  } catch (error) {
    console.warn('Print error fallback', error);
    window.print();
  }
}
