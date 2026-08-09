const { Document, Packer, Paragraph, TextRun } = require('docx');
const officeParser = require('officeparser');

async function test() {
  const doc = new Document({
    sections: [{ properties: {}, children: [new Paragraph("Hello DOCX")] }]
  });
  const b64 = await Packer.toBase64String(doc);
  const buffer = Buffer.from(b64, 'base64');
  
  try {
    const result = await officeParser.parseOffice(buffer, { fileType: 'docx' });
    console.log(result.toText());
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
