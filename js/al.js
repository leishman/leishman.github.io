//Content functionality (for navigation)
$(document).ready(function(){
	$('#projects').css("display","none");
	$('#about').css("display","block");
	$('#link-about').css("font-weight","bold");
});

$('#link-projects').click(function(){
	$('#projects').css("display","block");
	$('#about').css("display","none");
	$('#link-projects').css("font-weight","bold")
	$('#link-about').css("font-weight","normal");
});

$('#link-about').click(function(){
	$('#projects').css("display","none");
	$('#about').css("display","block");
	$('#link-about').css("font-weight","bold");
	$('#link-projects').css("font-weight","normal")
});

//Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-43911010-1', 'alexleishman.com');
ga('send', 'pageview');