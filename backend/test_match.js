const supabase = require('./supabase');

async function test() {
  const { data: chunks, error } = await supabase.rpc(
    'match_document_chunks',
    {
      query_embedding: new Array(384).fill(0.1),
      match_threshold: 0.0,
      match_count: 10,
      filter_user_id: null,
      filter_workspace_id: 'default'
    }
  );
  console.log("Error:", error);
  console.log("Chunks count:", chunks ? chunks.length : 0);
  if (chunks && chunks.length > 0) {
    console.log("First chunk user_id:", chunks[0].user_id);
    console.log("First chunk similarity:", chunks[0].similarity);
  }
}
test();
