const { neon } = require('@neondatabase/serverless');

function db(){
  if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurada');
  return neon(process.env.DATABASE_URL);
}

async function published(){
  const sql=db();
  return sql`SELECT * FROM articles WHERE status='published' ORDER BY COALESCE(published_at,created_at) DESC`;
}

async function articleBySlug(slug){
  const sql=db();
  const rows=await sql`SELECT * FROM articles WHERE slug=${slug} AND status='published' LIMIT 1`;
  return rows[0]||null;
}

async function allArticles(){
  const sql=db();
  return sql`SELECT * FROM articles ORDER BY updated_at DESC`;
}

async function submissions(){
  const sql=db();
  return sql`SELECT * FROM submissions ORDER BY created_at DESC LIMIT 40`;
}

async function saveArticle(b){
  const sql=db();
  const now=new Date().toISOString();
  const published=b.status==='published';
  if(b.id){
    const old=(await sql`SELECT * FROM articles WHERE id=${b.id} LIMIT 1`)[0];
    if(!old) return null;
    await sql`UPDATE articles SET title=${b.title},deck=${b.deck||''},body=${b.body||''},category=${b.category||'Comunidade'},author=${b.author||'Redação Em Pauta'},cover_url=${b.cover_url||''},cover_alt=${b.cover_alt||''},video_url=${b.video_url||''},source_label=${b.source_label||''},source_url=${b.source_url||''},status=${published?'published':'draft'},featured=${!!b.featured},breaking=${!!b.breaking},updated_at=${now},published_at=${published?(old.published_at||now):null} WHERE id=${b.id}`;
    return b.id;
  }
  const crypto=require('crypto');
  const id=crypto.randomUUID();
  const slug=String(b.title).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64)+'-'+Date.now().toString(36);
  await sql`INSERT INTO articles (id,slug,title,deck,body,category,author,cover_url,cover_alt,video_url,source_label,source_url,status,featured,breaking,created_at,updated_at,published_at) VALUES (${id},${slug},${b.title},${b.deck||''},${b.body||''},${b.category||'Comunidade'},${b.author||'Redação Em Pauta'},${b.cover_url||''},${b.cover_alt||''},${b.video_url||''},${b.source_label||''},${b.source_url||''},${published?'published':'draft'},${!!b.featured},${!!b.breaking},${now},${now},${published?now:null})`;
  return id;
}

async function deleteArticle(id){const sql=db();await sql`DELETE FROM articles WHERE id=${id}`;}
async function setSubmissionStatus(id,status){const sql=db();await sql`UPDATE submissions SET status=${status} WHERE id=${id}`;}
async function createSubmission(b){const sql=db();const crypto=require('crypto');const now=new Date().toISOString();await sql`INSERT INTO submissions (id,name,contact,subject,message,media_url,status,created_at) VALUES (${crypto.randomUUID()},${String(b.name).slice(0,100)},${String(b.contact||'').slice(0,150)},${String(b.subject).slice(0,180)},${String(b.message).slice(0,5000)},${String(b.media_url||'').slice(0,1000)},'Nova',${now})`;}

module.exports={published,articleBySlug,allArticles,submissions,saveArticle,deleteArticle,setSubmissionStatus,createSubmission};
