const crypto=require('crypto');
const {neon}=require('@neondatabase/serverless');

const MAX_VIDEO=25*1024*1024;
const MAX_CHUNK=1024*1024;
const ALLOWED=new Set(['video/mp4','video/webm']);

function sql(){if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL não configurada');return neon(process.env.DATABASE_URL)}
function cookies(req){return Object.fromEntries(String(req.headers.cookie||'').split(';').map(x=>x.trim().split('=').map(decodeURIComponent)).filter(x=>x[0]))}
function sig(v){return crypto.createHmac('sha256',process.env.SESSION_SECRET||'').update(v).digest('base64url')}
function isAdmin(req){try{const t=cookies(req).ep_session;if(!t)return false;const [p,s]=t.split('.');if(!p||!s)return false;const a=Buffer.from(s),b=Buffer.from(sig(p));if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return false;const d=JSON.parse(Buffer.from(p,'base64url').toString());return d.exp>Date.now()&&d.email===process.env.ADMIN_EMAIL}catch{return false}}
function body(req){return req.body||{}}
function decodeChunk(v){const s=String(v||'');const m=/^data:application\/octet-stream;base64,([A-Za-z0-9+/=]+)$/.exec(s);if(!m)return null;const bytes=Buffer.from(m[1],'base64');if(!bytes.length||bytes.length>MAX_CHUNK)return null;return bytes}
function cleanName(v){return String(v||'video').replace(/[^a-zA-Z0-9._ -]/g,'').slice(0,160)||'video'}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}

module.exports=async(req,res)=>{
  try{
    const db=sql();
    if(req.method==='GET'){
      const id=String(req.query?.id||'');
      if(!id)return res.status(400).end();
      const rows=await db`SELECT id,mime_type,file_name,size_bytes,chunk_size,chunk_count,completed_at FROM video_media WHERE id=${id} LIMIT 1`;
      if(!rows.length||!rows[0].completed_at)return res.status(404).end();
      const meta=rows[0],size=Number(meta.size_bytes),chunkSize=Number(meta.chunk_size);
      let start=0,end=size-1,status=200;
      const range=String(req.headers.range||'');
      if(range){const m=/bytes=(\d+)-(\d*)/.exec(range);if(m){start=clamp(Number(m[1]),0,size-1);end=m[2]?clamp(Number(m[2]),start,size-1):Math.min(size-1,start+4*1024*1024-1);status=206}}
      const first=Math.floor(start/chunkSize),last=Math.floor(end/chunkSize);
      const chunks=await db`SELECT chunk_index,bytes FROM video_chunks WHERE video_id=${id} AND chunk_index>=${first} AND chunk_index<=${last} ORDER BY chunk_index`;
      if(!chunks.length)return res.status(404).end();
      const joined=Buffer.concat(chunks.map(r=>Buffer.isBuffer(r.bytes)?r.bytes:Buffer.from(r.bytes)));
      const offset=start-first*chunkSize;
      const out=joined.subarray(offset,offset+(end-start+1));
      res.setHeader('Content-Type',meta.mime_type);
      res.setHeader('Accept-Ranges','bytes');
      res.setHeader('Content-Length',String(out.length));
      res.setHeader('Cache-Control','public, max-age=31536000, immutable');
      if(status===206)res.setHeader('Content-Range',`bytes ${start}-${end}/${size}`);
      res.statusCode=status;return res.end(out);
    }
    if(req.method!=='POST')return res.status(405).end();
    if(!isAdmin(req))return res.status(401).json({error:'Não autorizado.'});
    const b=body(req),action=String(b.action||'');
    if(action==='init'){
      const mime=String(b.mimeType||''),size=Number(b.size||0),name=cleanName(b.fileName);
      if(!ALLOWED.has(mime))return res.status(400).json({error:'Use vídeo MP4 ou WebM.'});
      if(!size||size>MAX_VIDEO)return res.status(400).json({error:'O vídeo deve ter até 25 MB.'});
      const id=crypto.randomUUID(),count=Math.ceil(size/MAX_CHUNK);
      await db`INSERT INTO video_media(id,mime_type,file_name,size_bytes,chunk_size,chunk_count,uploaded_by) VALUES(${id},${mime},${name},${size},${MAX_CHUNK},${count},'admin')`;
      return res.status(200).json({ok:true,id,chunkSize:MAX_CHUNK,chunkCount:count});
    }
    if(action==='chunk'){
      const id=String(b.id||''),index=Number(b.index),bytes=decodeChunk(b.dataUrl);
      if(!id||!Number.isInteger(index)||index<0||!bytes)return res.status(400).json({error:'Parte do vídeo inválida.'});
      const metas=await db`SELECT chunk_count FROM video_media WHERE id=${id} AND completed_at IS NULL LIMIT 1`;
      if(!metas.length||index>=Number(metas[0].chunk_count))return res.status(404).json({error:'Envio não encontrado.'});
      await db`INSERT INTO video_chunks(video_id,chunk_index,bytes) VALUES(${id},${index},${bytes}) ON CONFLICT(video_id,chunk_index) DO UPDATE SET bytes=excluded.bytes`;
      return res.status(200).json({ok:true,index});
    }
    if(action==='complete'){
      const id=String(b.id||'');
      const rows=await db`SELECT v.size_bytes,v.chunk_count,COUNT(c.chunk_index)::int AS received,COALESCE(SUM(octet_length(c.bytes)),0)::bigint AS bytes FROM video_media v LEFT JOIN video_chunks c ON c.video_id=v.id WHERE v.id=${id} GROUP BY v.id LIMIT 1`;
      if(!rows.length)return res.status(404).json({error:'Envio não encontrado.'});
      const r=rows[0];
      if(Number(r.received)!==Number(r.chunk_count)||Number(r.bytes)!==Number(r.size_bytes))return res.status(400).json({error:'O vídeo ainda não terminou de enviar.'});
      await db`UPDATE video_media SET completed_at=now() WHERE id=${id}`;
      return res.status(200).json({ok:true,url:`/api/video-upload?id=${encodeURIComponent(id)}`});
    }
    if(action==='cancel'){
      const id=String(b.id||'');if(id)await db`DELETE FROM video_media WHERE id=${id}`;
      return res.status(200).json({ok:true});
    }
    return res.status(400).json({error:'Ação inválida.'});
  }catch(e){console.error(e);return res.status(500).json({error:'Não foi possível processar o vídeo.'})}
};
