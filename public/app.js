function getToken() {
  return localStorage.getItem('token');
}
function setToken(t) {
  localStorage.setItem('token', t);
}
function logout() { localStorage.removeItem('token'); }

async function register(e){
  e.preventDefault();
  const username=document.getElementById('username').value;
  const password=document.getElementById('password').value;
  const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
  const data=await r.json();
  if(data.token){setToken(data.token); location.href='/';}else alert(data.error);
}

async function login(e){
  e.preventDefault();
  const username=document.getElementById('username').value;
  const password=document.getElementById('password').value;
  const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
  const data=await r.json();
  if(data.token){setToken(data.token); location.href='/';}else alert(data.error);
}

async function checkFake(e){
  e.preventDefault();
  const text=document.getElementById('text').value;
  const link=document.getElementById('link').value;
  const r=await fetch('/api/check',{method:'POST',headers:{'Content-Type':'application/json','x-token':getToken()},body:JSON.stringify({text,link})});
  const data=await r.json();
  if(data.result){
    const resDiv=document.getElementById('result');
    resDiv.textContent='Wynik: '+data.result;
    resDiv.className=data.result;
  } else alert(data.error);
}

async function loadFeed(){
  const r=await fetch('/api/submissions');
  const items=await r.json();
  const container=document.getElementById('feed');
  container.innerHTML='';
  items.forEach(item=>{
    const div=document.createElement('div');
    div.innerHTML=`<p>${item.text||item.link} <strong class="${item.result}">${item.result}</strong></p>`;
    const voteBtn=document.createElement('button');
    voteBtn.textContent='Vote Fake';
    voteBtn.onclick=()=>vote(item.id,1);
    div.appendChild(voteBtn);
    const commentForm=document.createElement('form');
    commentForm.innerHTML='<input placeholder="Komentarz"/><button>Dodaj</button>';
    commentForm.onsubmit=(e)=>{e.preventDefault();comment(item.id,commentForm.firstChild.value);};
    div.appendChild(commentForm);
    container.appendChild(div);
  });
}

async function vote(id,voteVal){
  const r=await fetch('/api/vote',{method:'POST',headers:{'Content-Type':'application/json','x-token':getToken()},body:JSON.stringify({submissionId:id,vote:voteVal})});
  const d=await r.json();
  if(d.error) alert(d.error); else alert('Dziękujemy za głos');
}

async function comment(id,text){
  const r=await fetch('/api/comment',{method:'POST',headers:{'Content-Type':'application/json','x-token':getToken()},body:JSON.stringify({submissionId:id,text})});
  const d=await r.json();
  if(d.error) alert(d.error); else alert('Komentarz dodany');
}

async function loadProfile(){
  const r=await fetch('/api/user',{headers:{'x-token':getToken()}});
  const data=await r.json();
  if(data.user){
    document.getElementById('user').textContent=data.user.username;
    const list=document.getElementById('history');
    data.submissions.forEach(s=>{
      const li=document.createElement('li');
      li.textContent=(s.text||s.link)+' - '+s.result;
      list.appendChild(li);
    });
  } else {
    alert('Musisz być zalogowany');
    location.href='/login.html';
  }
}

async function deleteAccount(){
  const r=await fetch('/api/user',{method:'DELETE',headers:{'x-token':getToken()}});
  const d=await r.json();
  if(d.success){logout();location.href='/';}
}
