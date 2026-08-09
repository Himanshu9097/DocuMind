const supabase = require('./supabase');

async function test() {
  const { data: docs, error: docError } = await supabase.from('documents').select('id, filename').order('created_at', { ascending: false }).limit(1);
  if (docError || !docs || docs.length === 0) {
    console.log("No documents found");
    return;
  }
  
  const docId = docs[0].id;
  console.log("Latest document:", docs[0].filename);
  
  const { data: chunks, error: chunkError } = await supabase.from('document_chunks').select('id').eq('document_id', docId);
  console.log("Chunk error:", chunkError);
  console.log("Chunks count:", chunks ? chunks.length : 0);
}
test();
