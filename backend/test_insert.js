const supabase = require('./supabase');

async function testInsert() {
  const dummyEmbedding = Array(384).fill(0.1);
  const { data, error } = await supabase.from('document_chunks').insert([{
    document_id: 'd1e7cacb-6fcc-4961-ad01-91ca37634564', // valid doc
    user_id: 'fec84512-cb8d-433c-b854-5e621034352a',
    workspace_id: 'default',
    content: 'Dummy chunk',
    embedding: dummyEmbedding
  }]);
  
  console.log("Error:", error);
}
testInsert();
