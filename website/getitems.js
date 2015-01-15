function getData( name , callback)
{
     var result = null;
     var scriptUrl = name;
     $.ajax({
        url: scriptUrl,
        type: 'get',
        dataType: 'text',
        async: false,
        success: function(data) {
            callback(data);
        } 
     });
}
function loadItems() {
	getData("items.txt", function(data) {
	var items = JSON.parse(data);
	$( ".item" ).remove();
	for (i = 0; i < items["items"].length; i++) {
		if(items["items"][i].category == $("#cat").text() || $("#cat").text() == "All") {
			console.log(items["items"][i].name);
			$(".main").append('<a href = "#' + i +'" class="link"><div class = "item"><h3>' + items["items"][i].name + '</h3><img class="itemimage" src="' + items["items"][i].pic + '" alt = "' + items["items"][i].name +'"></a>');
			//$(".main").append('<a href = "#' + i +'" class="link"><h3>' + items["items"][i].name + '</h3></a>');
			//$(".main").append('<a href = "#' + i +'" class="link"><img src="' + items["items"][i].pic + '" alt = "' + items["items"][i].name +'" style="width:350px;height:350px"></a>');
		}
	}
	});
}

function viewItem(i) {
	$( ".item" ).remove();
	console.log("view items");
	getData("items.txt", function(data) {
		var items = JSON.parse(data);
		var cost = items["items"][i].basecost;
		$(".main").append('<div class = "item"><h3>' + items["items"][i].name + '</h3><img class="itemimage" src="' + items["items"][i].pic + '" alt = "' + items["items"][i].name +'"><p>' + items["items"][i].description + '</p><p>Base cost: ' + items["items"][i].basecost + ' credits</p>');
		var options = '<div class = "options">';
		options += '<form id = "order">';
		options += 'Color: '
		options += '<select class = "opt" name="color">'
		for (c = 0; c < items["items"][i].colours.length; c++) {
			options += '<option value="' + items["items"][i].colours[c].colour + '" mod = "' + items["items"][i].colours[c].mod + '">' + items["items"][i].colours[c].colour;
			if (items["items"][i].colours[c].mod != 0) {
				if(c==0) {
					cost += +items["items"][i].colours[c].mod;
				}
				if (items["items"][i].colours[c].mod < 0) {
					options += ' (' + items["items"][i].colours[c].mod + ')';
				} else {
					options += ' (+' + items["items"][i].colours[c].mod + ')';
				}
			}
			options += '</option>'
		}
		options += '</select><br />';
		for (c = 0; c < items["items"][i].custom.length; c++) {
			options += '<br />';
			//options += '<br />';
			var cust = items["items"][i].custom[c];
			options += cust.name + ': ';
			options += '<select class="custopt" name="' + cust.name+'">';
			for (n = 0; n < cust.values.length; n++) {
				options += '<option value="' + cust.values[n].name + '" mod="' + cust.values[n].mod + '">' + cust.values[n].name;
				if (cust.values[n].mod != 0) {
					if(n==0) {
						cost += +cust.values[n].mod;
					}
					if (cust.values[n].mod < 0) {
						options += ' (' + cust.values[n].mod + ')';
					} else {
						options += ' (+' + cust.values[n].mod + ')';
					}
				}
				options += '</option>';
			}
			options += '</select>';
			//console.log(c);
			options += '<p class = "small">' + cust.description + '</p>';
		}
		var name = "";
		var email= "";
		var phone= "";
		if(localStorage.getItem("name")) {
			name = localStorage.getItem("name");
		}
		if(localStorage.getItem("email")) {
			email = localStorage.getItem("email");
		}
		if(localStorage.getItem("phone")) {
			phone = localStorage.getItem("phone");
		}
		options += '<hr>';
		options += 'Name: <input type = "text" value = "' + name + '" name = "name">'
		options += '<br />';
		options += '<br />';
		options += 'Email: <input type = "text" value = "' + email + '" name = "email">'
		options += '<p class = "small">Must have either email or phone number for confirming order</p>';
		options += '<br />';
		options += 'Phone: <input type = "text" value = "' + phone + '" name = "phone">'
		options += '<br />';
		options += '<hr>Notes:<textarea rows="4" cols="50" id = "notes"></textarea><hr>';
		options += '<p id = "cost"></p><p id = "yourcredits"></p>';
		options += '<input type="submit" value="Place order">';
		options += '</form><p id = "orderresult"></p></div>';
		console.log(options);
		$(".item").append(options);
		$( "#cost" ).html("Cost: " + cost + " credits");
		$(".opt").change(function(){
			/*var optionSelected = $(this).find('option:selected').attr('mod');
			cost += +optionSelected;
			console.log(cost);*/
			/*$("option:selected").each(function()
			{
				var optionSelected = $(this).attr('mod');
				cost += +optionSelected;
				console.log(cost);
			});*/
			cost = items["items"][i].basecost;
			$(".opt option:selected").each(function () {
				cost += +$(this).attr('mod');
			});
			$(".custopt option:selected").each(function () {
				cost += +$(this).attr('mod');
			});
			$( "#cost" ).html("Cost: " + cost + " credits");
		});
		$(".custopt").change(function(){
			/*var optionSelected = $(this).find('option:selected').attr('mod');
			cost += +optionSelected;
			console.log(cost);*/
			/*$("option:selected").each(function()
			{
				var optionSelected = $(this).attr('mod');
				cost += +optionSelected;
				console.log(cost);
			});*/
			cost = items["items"][i].basecost;
			$(".opt option:selected").each(function () {
				cost += +$(this).attr('mod');
			});
			$(".custopt option:selected").each(function () {
				cost += +$(this).attr('mod');
			});
			$( "#cost" ).html("Cost: " + cost + " credits");
		});
		$.ajax({
		  type: 'POST',
		  url: "http://192.168.110.127:4242/users/getcredits",
		  crossDomain: true,
		  data: {user:localStorage.getItem("user"), token:localStorage.getItem("token")},
		  cache: false,
		  success: function(data) {
			if($.trim(data) == "false") {
			  //do nothing
			}
			else {
				if(data.success) {
					$("#yourcredits").text("Your credits: "+data.credits);
				} else {
					$("#yourcredits").text("Could not get credits. You may have to pay with cash");
				}
			}

		  }
		});
		$( "#order" ).submit(function( event ) {
				// Stop form from submitting normally
				event.preventDefault();
				// Get some values from elements on the page:
				var $form = $( this ),
				name = $form.find( "input[name='name']").val(),
				email = $form.find( "input[name='email']").val(),
				phone = $form.find( "input[name='phone']").val(),
				notes = $("#notes").val(),
				item = items["items"][i].name,/*special!*/
				colour = $(".opt option:selected").val(),
				user = localStorage.getItem("user"),//
				token = localStorage.getItem("token"),//
				url = "http://192.168.110.127:4242/orders/placeorder"
				
				var cust = {"fields":[]};
				$(".custopt option:selected").each(function () {
					cust.fields.push({"name": $(this).parent().attr("name"), "value": $(this).val()});
					console.log($(this).parent().attr("name"));
				});
				console.log(notes);
				
				// Send the data using post
				$.ajax({
					  type: 'POST',
					  url: url,
					  crossDomain: true,
					  data: {name:name, email:email, phone:phone, item:item, cost:cost, colour:colour, notes:notes, custom:JSON.stringify(cust), user:user, token:token},
					  cache: false,
					  success: function(data) {

						if($.trim(data) == "false") {
						  $("#orderresult").html('Order failed.');
						}
						else {
						  console.log(data);
						  if(data.success == true) {
							$("#orderresult").html('Order placed');
						  } else {
							$("#orderresult").html(data.message);
						  }
						}

					  }
					});
			});
	});
}



$(document).ready(function() {
	var page = window.location.hash.substr(1);
	//$(".close").attr("href","#" + page);
	if(page == "elec") {
		$("#cat").html("Electronics");
		loadItems();
	} else if (page == "house") {
		$("#cat").html("Household");
		loadItems();
	} else if (page == "other") {
		$("#cat").html("Other");
		loadItems();
	} else if (page == "") {
		$("#cat").html("All");
		loadItems();
	} else if (!isNaN(page)) {
		viewItem(+page);
	} else {
		$("#cat").html("All");
		loadItems();
	}
});
window.onhashchange = function () {
	var page = window.location.hash.substr(1);
	//$(".close").attr("href","#" + page);
	if(page == "elec") {
		$("#cat").html("Electronics");
		loadItems();
	} else if (page == "house") {
		$("#cat").html("Household");
		loadItems();
	} else if (page == "other") {
		$("#cat").html("Other");
		loadItems();
	} else if (!isNaN(page)) {
		viewItem(+page);
	} else {
		$("#cat").html("All");
		loadItems();
	}
};