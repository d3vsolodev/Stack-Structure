(function(){
  var $=function(id){return document.getElementById(id)};
  var stack=[],cap=8,cur=0,last="",hist=[];
  var stackEl=$("stack");

  function bump(id,v){var e=$(id);if(e.textContent!==String(v)){e.textContent=v;e.classList.remove("bump");void e.offsetWidth;e.classList.add("bump")}}
  function stats(){
    bump("size",stack.length);
    bump("topv",stack.length?stack[stack.length-1]:"-");
    bump("free",cap-stack.length);
    $("capv").textContent=cap;
    $("emptyMsg").style.display=stack.length?"none":"flex";
  }
  function build(v,isTop){
    var d=document.createElement("div");d.className="cell"+(isTop?" top":"");
    var t=document.createElement("span");t.textContent=v;
    var g=document.createElement("span");g.className="tg";g.textContent="top";
    d.appendChild(t);d.appendChild(g);return d;
  }
  function render(){
    stackEl.querySelectorAll(".cell").forEach(function(n){n.remove()});
    stack.forEach(function(v,i){var d=build(v,i===stack.length-1);d.style.animation="none";stackEl.appendChild(d)});
    stats();
  }
  function cells(){return stackEl.querySelectorAll(".cell:not(.out)")}
  function wiggle(el){if(el){el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash")}}
  function bad(m){throw {bad:m}}

  var OPS=[
   {t:"Push",d:"Adds an element to the top of the stack. Fails with an overflow if the stack is full.",need:true,h:"Type a value, then run. Pressing Enter also works.",r:function(v){
     if(!v)bad("Type something first ✏️");
     if(stack.length>=cap)bad("Overflow: the stack is full 🙈");
     var o=stackEl.querySelector(".cell.top");if(o)o.classList.remove("top");
     stack.push(v);stackEl.appendChild(build(v,true));$("inp").value="";
     return "push("+v+") ✨ pushed "+v}},
   {t:"Pop",d:"Removes the top element from the stack and returns it.",r:function(){
     if(!stack.length)bad("Underflow: nothing to pop, it’s empty 🫧");
     var v=stack.pop(),top=stackEl.querySelector(".cell.top");
     if(top){top.classList.remove("top");top.classList.add("out");setTimeout(function(){top.remove()},300)}
     var c=cells();if(c.length)c[c.length-1].classList.add("top");
     return "pop() → "+v+" 👋"}},
   {t:"Peek",d:"Returns the top element without removing it.",r:function(){
     if(!stack.length)bad("Empty, nothing to peek at 🫧");
     wiggle(stackEl.querySelector(".cell.top"));return "peek() → "+stack[stack.length-1]+" 👀"}},
   {t:"IsEmpty",d:"Checks if the stack is empty.",r:function(){return "isEmpty() → "+!stack.length}},
   {t:"IsFull",d:"Checks if the stack is full (useful for fixed-size arrays).",r:function(){return "isFull() → "+(stack.length>=cap)}},
   {t:"Size",d:"Reports how many elements are in the stack compared with its capacity.",r:function(){return "size() → "+stack.length+" of "+cap+" 📏"}},
   {t:"Search",d:"Finds a value and tells you how far it is from the top.",need:true,h:"Type the value to look for.",r:function(v){
     if(!v)bad("Type a value to search for 🔍");
     var i=stack.lastIndexOf(v);if(i<0)bad(v+" is not in the stack 🫥");
     wiggle(cells()[i]);return "search("+v+") → "+(stack.length-1-i)+" from the top 🔎"}},
   {t:"Reverse",d:"Flips the order of the stack so the top becomes the bottom.",r:function(){
     if(stack.length<2)bad("Need at least 2 items to reverse 🔄");
     stack.reverse();render();return "reverse() 🔄 done"}},
   {t:"Fill",d:"Adds random numbers until the stack is full, handy for testing overflow.",r:function(){
     if(stack.length>=cap)bad("Already full 🙈");
     var n=0;while(stack.length<cap){stack.push(String(Math.floor(Math.random()*90)+10));n++}
     render();return "fill() 🎲 added "+n+" items"}},
   {t:"Clear",d:"Removes every element from the stack at once.",r:function(){stack=[];render();return "clear() 🧹 all gone"}}
  ];

  function list(){
    var q=$("q").value.trim().toLowerCase(),box=$("list");box.innerHTML="";var n=0;
    OPS.forEach(function(x,i){
      if(q&&x.t.toLowerCase().indexOf(q)<0)return;n++;
      var b=document.createElement("button");b.className="item"+(i===cur?" on":"");
      var s=document.createElement("b");s.textContent=i+1;var t=document.createElement("span");t.textContent=x.t;
      b.appendChild(s);b.appendChild(t);b.onclick=function(){pick(i,true)};box.appendChild(b);
    });
    if(!n){var d=document.createElement("div");d.className="none";d.textContent="No operations match.";box.appendChild(d)}
  }
  function pick(i,f){
    cur=i;var x=OPS[i];
    $("cnt").textContent="Operation "+(i+1)+" of "+OPS.length;$("title").textContent=x.t;$("desc").textContent=x.d;
    $("inwrap").style.display=x.need?"block":"none";
    $("hint").textContent=x.h||"No input required.";
    list();
    var on=document.querySelector(".item.on");
    if(on&&on.scrollIntoView)on.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"});
    if(x.need&&f&&!matchMedia("(hover:none)").matches)$("inp").focus();
  }
  function out(){
    $("res").textContent=hist.join("\n")||"Ready. Press Run operation to see the result.";
    $("res").classList.remove("fade");void $("res").offsetWidth;$("res").classList.add("fade");
  }
  function run(){
    var x=OPS[cur],ok=true,m;
    try{m=x.r($("inp").value.trim())}catch(e){ok=false;m=e&&e.bad?e.bad:"Something went wrong."}
    hist.unshift((ok?"✓ ":"✗ ")+m);if(hist.length>8)hist.pop();
    $("st").textContent=ok?"Done ✓":"Oops";$("st").className=ok?"":"bad";
    if(ok)last=m;out();stats();
  }
  function reset(){
    stack=["10","20","30"];cap=8;$("capacity").value=8;hist=[];last="";render();
    $("st").textContent="Ready";$("st").className="";out();
  }
  $("run").onclick=run;$("reset").onclick=reset;
  $("copy").onclick=function(){
    if(!last){$("st").textContent="Run first";return}
    try{navigator.clipboard.writeText(last).then(function(){$("st").textContent="Copied ✓"},function(){$("st").textContent="Select to copy"})}catch(e){$("st").textContent="Select to copy"}
  };
  $("q").oninput=list;
  $("inp").addEventListener("keydown",function(e){if(e.key==="Enter")run()});
  $("capacity").oninput=function(e){cap=+e.target.value;while(stack.length>cap)stack.pop();render()};
  $("theme").onclick=function(){
    var r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;
    r.dataset.theme=dark?"light":"dark";$("theme").textContent=dark?"🌙":"☀️";
  };
  reset();pick(0);
})();
