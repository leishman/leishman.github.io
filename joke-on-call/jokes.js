var myJokes = new Array();
myJokes[0] = "What time did Sean Connery arrive at Wimbledon?";
myJokes[1] = "What did the Zero say to the Eight?";
myJokes[2] = "What is a pirate's favorite animal?";
myJokes[3] = "How can you tell if a man is blind at a nude beach?";
myJokes[4] = "What did the clam do on his birthday?";
myJokes[5] = "What's brown and sticky?";
myJokes[6] = "How many potatoes does it take to kill an Irishman?";
myJokes[7] = "Why did the scarecrow win the Nobel Prize?";
myJokes[8] = "A fish swims into a wall.";
myJokes[9] = "What did the ghost order at the Italian restaurant?";
myJokes[10] = "Why was the 6 scared of the 7?";
myJokes[11] = "What kind of bees give milk?";
myJokes[12] = "I was at the zoo the other day. All they had was one dog.";
myJokes[13] = "What kind of makeup does a ghost wear?";
myJokes[14] = "What's orange and sounds like a parrot?"
myJokes[15] = "The Future, the Present and the Past walk into a bar";
myJokes[16] = "How many tickles does it take to make an octopus laugh?";
myJokes[17] = "A: What is the integral of 1/cabin? \nB: log cabin\nA: No, houseboat. You forgot the C!";
// myJokes[18] = "";
//myJokes[19] = "";

var myPunchlines = new Array();
myPunchlines[0] = "tennish";
myPunchlines[1] = "Nice belt!";
myPunchlines[2] = "An aarrrrr-vark!";
myPunchlines[3] = "It's not hard";
myPunchlines[4] = "He shell-ebrated!!";
myPunchlines[5] = "A stick!";
myPunchlines[6] = "Zero";
myPunchlines[7] = "He was outstanding in his field";
myPunchlines[8] = "Dam";
myPunchlines[9] = "Fettuccine Afraid-O!";
myPunchlines[10] = "because 7-8-9";
myPunchlines[11] = "boo-bees!";
myPunchlines[12] = "It was a shit-zoo";
myPunchlines[13] = "mas-SCARE-a!";
myPunchlines[14] = "a carrot";
myPunchlines[15] = "It was tense.";
myPunchlines[16] = "TEN-tickles";
myPunchlines[17] = ""; //leave blank
// myPunchlines[18] = "";


$(document).ready(function(){

	$('#joke').html(myJokes[0]);
	$('#punchline').html(myPunchlines[0]);
	// $('<img src="sirconnery.gif"/>').appendTo('#content');
	
	$('.btn').click(function(){
  	  var num = Math.floor(Math.random()*myJokes.length);
	  $('#joke').html(myJokes[num]);
 	  $('#punchline').html(myPunchlines[num]);
        });
	

});







