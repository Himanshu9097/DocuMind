const supabase = require('./supabase');

async function checkChunks() {
  const { data, error } = await supabase.from('document_chunks').select('id, user_id, content').limit(5);
  console.log("Error:", error);
  console.log("Data length:", data ? data.length : 0);
  if (data && data.length > 0) {
    console.log("Sample:", data[0]);
  }
}
checkChunks();
