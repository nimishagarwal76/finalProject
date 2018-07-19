  var http = new XMLHttpRequest();
  var num = false;
  document.addEventListener('DOMContentLoaded', function (){
  document.getElementById("sub").addEventListener('click', function(e){
console.log('ji');
if(num)
 {
     console.log('hey');
   e.preventDefault();
 }
});
// var register = document.forms['register'];

});



  function check(){

  var val = document.getElementById('username').value;
  var url ="/calendar/ajax/user?username="+escape(val);
  http.open("GET", url, true);
  http.send(null);
  http.onreadystatechange=function(){
   if (http.readyState==4 && http.status==200){
    num = JSON.parse(http.responseText);
   var msg = document.getElementById('msg');
   console.log('num',num);
   if(num || val=='')
   {
     msg.style.fontSize= 'small';
     msg.style.color= 'red';
     msg.innerHTML=" *not available";

   }
   else
   {
     msg.style.fontSize= 'small';
     msg.style.color= 'green';
       msg.innerHTML=" *available";
   }
       }
};

};
