const { Document, Packer, Paragraph, TextRun } = require('docx');
const officeParser = require('officeparser');

async function test() {
  const doc = new Document({
    sections: [{ properties: {}, children: [new Paragraph("Hello DOCX")] }]
  });
  const b64 = await Packer.toBase64String(doc);
  const buffer = Buffer.from(b64, 'base64');
  
  try {
    const parsed = await officeParser.parseOffice(buffer, { fileType: 'docx' });
    const textContent = parsed.toText();
    console.log("typeof toText():", typeof textContent);
    const md = await parsed.to('md');
    console.log("typeof to('md'):", typeof md);
    console.log(md);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
