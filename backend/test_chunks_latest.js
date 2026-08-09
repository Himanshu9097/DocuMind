const supabase = require('./supabase');

async function testChunks() {
  const { data, error } = await supabase.from('document_chunks').select('content').eq('document_id', '52cbaedb-34a1-4322-a9b0-9f5a7707e4d8'); // I don't know the exact ID, so I'll just get the latest chunk
  
  const { data: latestChunks } = await supabase.from('document_chunks').select('content, document_id').order('id', { ascending: false }).limit(5);
  console.log(latestChunks);
}
testChunks();
