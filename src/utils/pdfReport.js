const puppeteer = require('puppeteer');

function generateReportHTML(report) {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 2em; font-weight: bold; color: #2c3e50; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; color: #34495e; }
          .value { margin-left: 10px; }
          .box { border: 1px solid #ccc; border-radius: 8px; padding: 20px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Patient Diagnostic Report</div>
          <div>Generated: ${new Date(report.createdAt).toLocaleString()}</div>
        </div>
        <div class="box">
          <div class="section">
            <span class="label">Patient Name:</span>
            <span class="value">${report.patientId.name}</span>
          </div>
          <div class="section">
            <span class="label">Age:</span>
            <span class="value">${report.patientId.age}</span>
            <span class="label">Gender:</span>
            <span class="value">${report.patientId.gender}</span>
            <span class="label">Contact:</span>
            <span class="value">${report.patientId.contact}</span>
          </div>
          <div class="section">
            <span class="label">Test Name:</span>
            <span class="value">${report.testId.name}</span>
          </div>
          <div class="section">
            <span class="label">Description:</span>
            <span class="value">${report.testId.description}</span>
          </div>
          <div class="section">
            <span class="label">Cost:</span>
            <span class="value">₹${report.testId.cost}</span>
          </div>
          <div class="section">
            <span class="label">Result:</span>
            <span class="value">${report.reportData.result}</span>
          </div>
          <div class="section">
            <span class="label">Remarks:</span>
            <span class="value">${report.reportData.remarks || '-'}</span>
          </div>
          <div class="section">
            <span class="label">Tested At:</span>
            <span class="value">${new Date(report.reportData.testedAt).toLocaleString()}</span>
          </div>
        </div>
      </body>
    </html>
  `;
}

async function generatePDFBuffer(html) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();
  return pdfBuffer;
}

module.exports = { generateReportHTML, generatePDFBuffer }; 