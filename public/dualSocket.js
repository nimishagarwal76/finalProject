var feedback = document.getElementById('feedback');
var error = document.getElementById('errorMessage');
var btn = document.getElementById('start');
var next = document.getElementById('next');
var socket = io.connect('http://localhost:3000');
var output = document.getElementById('output');
var info = document.getElementById('info');
var quiz = document.getElementById('quiz');
var earned = document.getElementById('earned');
var spend = document.getElementById('spend');
var questionNumber = document.getElementById('qnumber');

var earnedMoney = 0,spendMoney = 0;
output.addEventListener('contextmenu', e => e.preventDefault());
btn.addEventListener('click',function(e){
  var room = '2';
  btn.style.display = 'none';
  document.getElementById('stats').style.display = 'block';
  socket.emit('user',{user:'<%=user%>'},function(data){

    if(data)
    {
      info.innerHTML='Wait for someone to join the Server';
    }
    else
    {
      info.innerHTML='Error You have one window Open';
    }
  });
});

quiz.addEventListener('click',function(e){
  if(e.target.id == 'playAgain')
  {
    location.reload();
  }


    if(e.target.id == 'correct')
    {
      e.target.style.background = '#abdfab';
      earnedMoney+=2;
      socket.emit('next',{earned:earnedMoney,spend:spendMoney});
      earned.innerHTML=earnedMoney;
    }
    if(e.target.id == 'incorrect')
    {
      e.target.style.background = '#ff000038';
      spendMoney+=1;
      socket.emit('next',{earned:earnedMoney,spend:spendMoney});
      spend.innerHTML=spendMoney;
    }

});




socket.on('play', function(info){
  fetch('https://opentdb.com/api.php?amount=1&type=multiple')
  .then((res)=>{return res.json()})
  .then((data)=>{
    socket.emit('chat',{
      query:data.results[0],
      questionNumber:info.question
    });
  });
});

socket.on('user',function(data){
  console.log('hi',data);
});


socket.on('chat',function(data){
  info.innerHTML="";
  output.innerHTML = `<p> ${data.query.question}</p>`
  feedback.innerHTML = `<p  id="correct"> ${data.query.correct_answer}</p>`
  data.query.incorrect_answers.forEach(function(answer){
    feedback.innerHTML += `<p id="incorrect"> ${answer}</p>`
  });
  questionNumber.innerHTML = data.questionNumber;
});

socket.on('win',function(data){
  feedback.innerHTML = '';
  output.innerHTML = '';
  questionNumber.innerHTML = '';
  info.innerHTML = `Your Opponent Left<br><img src="../../public/youWin.jpg" id="winImg" >
  <br><br><i class="fa fa-undo" id="playAgain"></i>`
});

socket.on('gameover',function(data){
  feedback.innerHTML = '';
  output.innerHTML = '';
  questionNumber.innerHTML = '';
  if(data.result == 'win')
  {
    info.innerHTML= `You Win
      <br><img src="../../public/win.jpg" id="winImg">
      <br><br><a href="menu"><i class="fa fa-home" aria-hidden="true"></i></a>&nbsp
      <i class="fa fa-undo" id="playAgain"></i>`;
  }
  else if (data.result == 'lost'){
    info.innerHTML= `You Lose
      <br><img src="../../public/lose.jpg" id="winImg">
      <br><br><a href="menu"><i class="fa fa-home" aria-hidden="true"></i></a>&nbsp<i class="fa fa-undo" id="playAgain"></i>`;
  }
});
