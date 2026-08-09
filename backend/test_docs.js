const supabase = require('./supabase');

async function checkDocs() {
  const { data, error } = await supabase.from('documents').select('id, user_id, filename');
  console.log("Error:", error);
  console.log("Docs:", data);
}
checkDocs();
