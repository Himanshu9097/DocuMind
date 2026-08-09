const officeParser = require('officeparser');

async function test() {
  try {
    const text = await officeParser.parseOfficeAsync(Buffer.from('dummy data'));
    console.log(text);
  } catch (e) {
    console.error("Error parsing:", e.message);
  }
}
test();
