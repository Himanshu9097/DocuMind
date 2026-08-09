const supabase = require('./supabase');

async function checkDocChunks() {
  const { data, error } = await supabase
    .from('document_chunks')
    .select('id, user_id, document_id, content')
    .eq('document_id', 'd1e7cacb-6fcc-4961-ad01-91ca37634564');
  console.log("Error:", error);
  console.log("Chunks count:", data ? data.length : 0);
  if (data && data.length > 0) {
    console.log("Sample:", data[0]);
  }
}
checkDocChunks();
