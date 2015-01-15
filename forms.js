
$(document).ready(function() { 
alert('loaded');
$('#login').submit(function() { 
	alert('worked');
    $.post("192.168.110.127:4242",
	  {
		user: $(this: user).fieldValue(),
		pass: $(this: pass).fieldValue(),
	  },
	  function(data,status){
		alert("Data: " + data + "\nStatus: " + status);
	  });
    // return false to prevent normal browser submit and page navigation 
    return false; 
});
});