const { parseOffice } = require('officeparser');

async function test() {
  try {
    const text = await parseOffice(Buffer.from('hello'));
    console.log(text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
