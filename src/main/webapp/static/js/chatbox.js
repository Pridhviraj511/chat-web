
var username = null;
var websocket = null;
var receiver = null;
var userAvatar = null;
var receiverAvatar = null;
var groupName = null;
var groupId = null

var back = null;
var rightSide = null;
var leftSide = null;
var conversation = null;

var attachFile = null;
var imageFile = null;
var file = null;
var listFile = [];
var typeFile = "image";
var deleteAttach = null;

var typeChat = "user";

window.onload = function() {
	if ("WebSocket" in window) {
		username = document.getElementById("username").textContent;
		userAvatar = document.getElementById("userAvatar").textContent;
		websocket = new WebSocket('ws://' + window.location.host + '/chat/' + username);

		websocket.onopen = function() {
		};

		websocket.onmessage = function(data) {
			setMessage(JSON.parse(data.data));
		};

		websocket.onerror = function() {
			console.log('An error occured, closing application');
			cleanUp();
		};

		websocket.onclose = function(data) {
			console.log(data.reason);
			cleanUp();
		};
	} else {
		console.log("Websockets not supported");
	}
}

window.onclick = function(e){
	let modalBox = document.querySelector(".modal-box");
	let addGroup = document.querySelector(".add-group");
	let closeModalBox = document.querySelector(".modal-box-close");
	
	if(closeModalBox.contains(e.target)){
		toggleModal(false);
	}
	else if(modalBox.contains(e.target) || addGroup.contains(e.target)){
		toggleModal(true);
	}else{
		toggleModal(false);
	}
	
	console.log(e.target);
}

function cleanUp() {
	username = null;
	websocket = null;
	receiver = null;
}

function setReceiver(element) {
	receiver = element.id;
	console.log("receiver: " + receiver);
	receiverAvatar = document.getElementById('img-' + receiver).src;
	var status = '';
	if (document.getElementById('status-' + receiver).classList.contains('online')) {
		status = 'online';
	}
	var rightSide = '<div class="user-contact">' + '<div class="back">'
		+ '<i class="fa fa-arrow-left"></i>'
		+ '</div>'
		+ '<div class="user-contain">'
		+ '<div class="user-img">'
		+ '<img src="' + receiverAvatar + '" '
		+ 'alt="Image of user">'
		+ '<div class="user-img-dot ' + status + '"></div>'
		+ '</div>'
		+ '<div class="user-info">'
		+ '<span class="user-name">' + receiver + '</span>'
		+ '</div>'
		+ '</div>'
		+ '<div class="setting">'
		+ '<i class="fa fa-cog"></i>'
		+ '</div>'
		+ '</div>'
		+ '<div class="list-messages-contain">'
		+ '<ul id="chat" class="list-messages">'
		+ '</ul>'
		+ '</div>'
		+ '<form class="form-send-message" onsubmit="return sendMessage(event)">'
		+ '<ul class="list-file"></ul> '
		+ '<input type="text" id="message" class="txt-input" placeholder="Type message...">'
		+ '<label class="btn btn-image" for="attach"><i class="fa fa-file"></i></label>'
		+ '<input type="file" multiple id="attach">'
		+ '<label class="btn btn-image" for="image"><i class="fa fa-file-image-o"></i></label>'
		+ '<input type="file" accept="image/*" multiple id="image">'
		+ '<button type="submit" class="btn btn-send">'
		+ '<i class="fa fa-paper-plane"></i>'
		+ '</button>'
		+ '</form>';

	document.getElementById("receiver").innerHTML = rightSide;

	loadMessages();

	displayFiles();

	makeFriend(rightSide);
}

function setGroup(element) {
	receiver = element.id;
	groupName = element.getAttribute("data-name");
	groupId  = element.getAttribute("id");
	console.log("receiver: " + receiver);

	var rightSide = '<div class="user-contact">' + '<div class="back">'
		+ '<i class="fa fa-arrow-left"></i>'
		+ '</div>'
		+ '<div class="user-contain">'
		+ '<div class="user-img">'
		+ '<img src="' + receiverAvatar + '" '
		+ 'alt="Image of user">'
		+ '</div>'
		+ '<div class="user-info">'
		+ '<span class="user-name">' + groupName + '</span>'
		+ '</div>'
		+ '</div>'
		+ '<div class="setting">'
		+ '<i class="fa fa-cog"></i>'
		+ '</div>'
		+ '</div>'
		+ '<div class="list-messages-contain">'
		+ '<ul id="chat" class="list-messages">'
		+ '</ul>'
		+ '</div>'
		+ '<form class="form-send-message" onsubmit="return sendMessage(event)">'
		+ '<ul class="list-file"></ul> '
		+ '<input type="text" id="message" class="txt-input" placeholder="Type message...">'
		+ '<label class="btn btn-image" for="attach"><i class="fa fa-file"></i></label>'
		+ '<input type="file" multiple id="attach">'
		+ '<label class="btn btn-image" for="image"><i class="fa fa-file-image-o"></i></label>'
		+ '<input type="file" accept="image/*" multiple id="image">'
		+ '<button type="submit" class="btn btn-send">'
		+ '<i class="fa fa-paper-plane"></i>'
		+ '</button>'
		+ '</form>';

	document.getElementById("receiver").innerHTML = rightSide;

	loadMessagesGroup();

	displayFiles();

	handleResponsive();
}

function resetChat(){
	let chatBtn = document.querySelectorAll(".tab-control i");
	let searchTxt = document.querySelector(".list-user-search input");
	let addGroupBtn = document.querySelector(".add-group");
	
	searchTxt.value = "";
	
	chatBtn.forEach(function(ele){
		ele.classList.remove("active");
	});
	
	if(typeChat == "group"){
		addGroupBtn.classList.add("active");
	}else{
		addGroupBtn.classList.remove("active");
	}
}

function createGroup(e){
	e.preventDefault();
	
	let groupName = document.querySelector(".txt-group-name").value;
	
	let object = new Object();
	let user = new Object();
	
	user.username = username;
	user.admin = true;
	
	object.name = groupName;
	object.users = [];
	object.users.push(user);
	console.log(JSON.stringify(object));
	
	fetch("http://" + window.location.host + "/conversations-rest-controller",{
			method: "post",
			cache: 'no-cache',
			headers: {
		      'Content-Type': 'application/json;charset=utf-8'
		    },
			body: JSON.stringify(object)
		})
		.then(function(data) {
			return data.json();
		})
		.then(function(data){
			console.log(data);
			
			if(typeChat != "group") return;
			let appendUser = '<li id="' + data.id + '" data-name="'+ data.name +'" onclick="setGroup(this);">'
					+ '<div class="user-contain">'
					+ '<div class="user-img">'
					+ '<img id="img-' + data.username + '"'
					+ ' src="http://' + window.location.host + '/files/' + data.id
					+ 'alt="Image of user">'
					+ '</div>'
					+ '<div class="user-info">'
					+ '<span class="user-name">' + data.name + '</span>'
					+ '<span'
					+ '</div>'
					+ '</div>'
					+ '</li>';
			document.querySelector(".list-user").innerHTML += appendUser;
			document.querySelector(".txt-group-name").value = "";
			
			toggleModal(false);
		});
}

function toggleModal(bol){
	let modalBox = document.querySelector(".modal-box");
	
	if(bol) modalBox.classList.add("active");
	else modalBox.classList.remove("active");
}

function chatOne(ele){
	typeChat = "user";
	resetChat();
	ele.classList.add("active");
	searchFriendByKeyword("");
	listFiles = [];
	handleResponsive();
}

function chatGroup(ele){
	typeChat = "group";
	resetChat();
	ele.classList.add("active");
	fetchGroup();
	listFiles = [];
	handleResponsive();
}

function makeFriend(rightSide) {
	fetch("http://" + window.location.host + "/friend-rest-controller?sender=" + username + "&receiver=" + receiver)
		.then(function(data) {
			return data.json();
		})
		.then(data => {
			var status = '';
			if (document.getElementById('status-' + receiver).classList.contains('online')) {
				status = 'online';
			}
		
			if (data.status == false && data.owner == username && data.owner != "any") {
				rightSide = '<div class="user-contact">' + '<div class="back">'
					+ '<i class="fa fa-arrow-left"></i>'
					+ '</div>'
					+ '<div class="user-contain">'
					+ '<div class="user-img">'
					+ '<img src="' + receiverAvatar + '" '
					+ 'alt="Image of user">'
					+ '<div class="user-img-dot '+ status +'"></div>'
					+ '</div>'
					+ '<div class="user-info">'
					+ '<span class="user-name">' + receiver + '</span>'
					+ '</div>'
					+ '</div>'
					+ '<span style="font-size:1.8rem">Sent Request</span>'
					+ '</form>'
					+ '</div>'
					+ '<div class="list-messages-contain">'
					+ '<ul id="chat" class="list-messages">'
					+ '</ul>'
					+ '</div>';
					
					document.getElementById("receiver").innerHTML = rightSide;
			} else if (data.status == false && data.owner != username && data.owner != "any") {
				rightSide = '<div class="user-contact">' + '<div class="back">'
					+ '<i class="fa fa-arrow-left"></i>'
					+ '</div>'
					+ '<div class="user-contain">'
					+ '<div class="user-img">'
					+ '<img src="' + receiverAvatar + '" '
					+ 'alt="Image of user">'
					+ '<div class="user-img-dot ' + status + '"></div>'
					+ '</div>'
					+ '<div class="user-info">'
					+ '<span class="user-name">' + receiver + '</span>'
					+ '</div>'
					+ '</div>'
					+ '<form action="http://' + window.location.host + '/chat" method="post" >'
					+ '<input type="hidden" name="sender" value="' + username + '">'
					+ '<input type="hidden" name="receiver" value="' + receiver + '">'
					+ '<input type="hidden" name="status" value="true">'
					+ '<input type="hidden" name="isAccept" value="true">'
					+ '<input class="btn" type="submit" value="Accept Friend Request">'
					+ '</form>'
					+ '</div>'
					+ '<div class="list-messages-contain">'
					+ '<ul id="chat" class="list-messages">'
					+ '</ul>'
					+ '</div>';
					document.getElementById("receiver").innerHTML = rightSide;
					
			}else if(data.status == false && data.sender == "any" && data.receiver == "any"){
				rightSide = '<div class="user-contact">' + '<div class="back">'
					+ '<i class="fa fa-arrow-left"></i>'
					+ '</div>'
					+ '<div class="user-contain">'
					+ '<div class="user-img">'
					+ '<img src="' + receiverAvatar + '" '
					+ 'alt="Image of user">'
					+ '<div class="user-img-dot ' + status + '"></div>'
					+ '</div>'
					+ '<div class="user-info">'
					+ '<span class="user-name">' + receiver + '</span>'
					+ '</div>'
					+ '</div>'
					+ '<form action="http://' + window.location.host + '/chat" method="post" >'
					+ '<input type="hidden" name="sender" value="' + username + '">'
					+ '<input type="hidden" name="receiver" value="' + receiver + '">'
					+ '<input type="hidden" name="status" value="false">'
					+ '<input type="hidden" name="isAccept" value="false">'
					+ '<input class="btn" type="submit" value="Add Friend">'
					+ '</form>'
					+ '</div>'
					+ '<div class="list-messages-contain">'
					+ '<ul id="chat" class="list-messages">'
					+ '</ul>'
					+ '</div>';
					document.getElementById("receiver").innerHTML = rightSide;
					
			}
			
			handleResponsive();
		})
		.catch(ex => console.log(ex));
}

function fetchGroup(){
	fetch("http://" + window.location.host + "/conversations-rest-controller?username=" + username)
		.then(function(data) {
			return data.json();
		})
		.then(data => {
			document.querySelector(".list-user").innerHTML = "";
			data.forEach(function(data) {
				if (data.isOnline) status = "online";
				else status = "";

				let appendUser = '<li id="' + data.id + '" data-name="'+ data.name +'" onclick="setGroup(this);">'
					+ '<div class="user-contain">'
					+ '<div class="user-img">'
					+ '<img id="img-' + data.username + '"'
					+ ' src="http://' + window.location.host + '/files/' + data.id
					+ 'alt="Image of user">'
					+ '</div>'
					+ '<div class="user-info">'
					+ '<span class="user-name">' + data.name + '</span>'
					+ '<span'
					+ '</div>'
					+ '</div>'
					+ '</li>';
				document.querySelector(".list-user").innerHTML += appendUser;
			});
		});
}

handleResponsive();

function handleResponsive() {
	back = document.querySelector(".back");
	rightSide = document.querySelector(".right-side");
	leftSide = document.querySelector(".left-side");
	conversation = document.querySelectorAll(".user-contain");

	if (back) {
		back.addEventListener("click", function() {
			rightSide.classList.remove("active");
			leftSide.classList.add("active");
			listFile = [];
			renderFile();
		});
	}

	conversation.forEach(function(element, index) {
		element.addEventListener("click", function() {
			rightSide.classList.add("active");
			leftSide.classList.remove("active");
		});
	});
}

function displayFiles() {
	attachFile = document.getElementById("attach");
	imageFile = document.getElementById("image");
	file = document.querySelector(".list-file");
	deleteAttach = document.querySelectorAll(".delete-attach");

	attachFile.addEventListener("change", function(e) {
		let filesInput = e.target.files;

		for (const file of filesInput) {
			listFile.push(file);
		}

		typeFile = "file";
		renderFile("attach");

		this.value = null;
	});

	imageFile.addEventListener("change", function(e) {
		let filesImage = e.target.files;

		for (const file of filesImage) {
			listFile.push(file);
		}

		typeFile = "image";

		renderFile("image");

		this.value = null;
	});



}

function deleteFile(idx) {
	if (!isNaN(idx)) listFile.splice(idx, 1);

	renderFile(typeFile);
}

function renderFile(typeFile) {
	let listFileHTML = "";
	let idx = 0;

	if (typeFile == "image") {
		for (const file of listFile) {
			listFileHTML += '<li><img src="' + URL.createObjectURL(file)
				+ '" alt="Image file"><span data-idx="'
				+ (idx) + '" onclick="deleteFile('
				+ idx + ')" class="delete-attach">X</span></li>';
			idx++;
		}
	} else {
		for (const file of listFile) {
			listFileHTML += '<li><div class="file-input">' + file.name
				+ '</div><span data-idx="'
				+ (idx) + '" onclick="deleteFile('
				+ idx + ')" class="delete-attach">X</span></li>';
			idx++;
		}
	}


	if (listFile.length == 0) {
		file.innerHTML = "";
		file.classList.remove("active");
	} else {
		file.innerHTML = listFileHTML;
		file.classList.add("active");
	}

	deleteAttach = document.querySelectorAll(".delete-attach");
}

function sendMessage(e) {
	e.preventDefault();
	
	var inputText = document.getElementById("message").value;
	if (inputText != '') {
		sendText();
	} else {
		sendAttachments();
	}
	
	return false;
}

function sendText() {
	var messageContent = document.getElementById("message").value;
	var messageType = "text";
	document.getElementById("message").value = '';
	var message = buildMessageToJson(messageContent, messageType);
	setMessage(message);
	websocket.send(JSON.stringify(message));
}

function sendAttachments() {
	var messageType = "attachment";
	for (file of listFile) {
		messageContent = file.name.trim();
		messageType = file.type;
		var message = buildMessageToJson(messageContent, messageType);
		websocket.send(JSON.stringify(message));
		websocket.send(file);
		
		if (messageType.startsWith("audio")) {
			message.message = '<audio controls>'
				+ '<source src="' + URL.createObjectURL(file) + '" type="' + messageType + '">'
				+ '</audio>';
		} else if (messageType.startsWith("video")) {
			message.message = '<video width="400" controls>'
				+ '<source src="' + URL.createObjectURL(file) + '" type="' + messageType + '">'
				+ '</video>';
		}else if (messageType.startsWith("image")) {
			message.message = '<img src="' + URL.createObjectURL(file) + '" alt="">';
		}
		else {
			message.message = '<a href= "' + URL.createObjectURL(file) + '">' + messageContent + '</a>'
		}
		setMessage(message);
	}
	file = document.querySelector(".list-file");
	file.classList.remove("active");
	file.innerHTML = "";
	listFile = [];
}

function buildMessageToJson(message, type) {
	return {
		username: username,
		message: message,
		type: type,
		receiver: receiver
	};
}

function setMessage(msg) {
	console.log("online users: " + msg.onlineList);
	if (msg.message != '[P]open' && msg.message != '[P]close') {
		var currentChat = document.getElementById('chat').innerHTML;
		var newChatMsg = customLoadMessage(msg.username, msg.message);
		document.getElementById('chat').innerHTML = currentChat
			+ newChatMsg;
		goLastestMsg();
	} else {
		if (msg.message === '[P]open') {
			msg.onlineList.forEach(username => {
				try {
					setOnline(username, true);
				} catch (ex) { }
			});
		} else {
			setOnline(msg.username, false);
		}

	}
}

function setOnline(username, isOnline) {
	var ele = document.getElementById('status-' + username);
	if (isOnline === true) {
		ele.classList.add('online');
	} else {
		ele.classList.remove('online');
	}
}

function loadMessagesGroup(){
	var currentChatbox = document.getElementById("chat");
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var messages = JSON.parse(this.responseText);
			var chatbox = "";
			messages.forEach(msg => {
				try {
					chatbox += customLoadMessageGroup(msg.username, msg.message);
				} catch (ex) {

				}
			});
			currentChatbox.innerHTML = chatbox;
			goLastestMsg();
		}
	};
	xhttp.open("GET", "http://" + window.location.host + "/conversations-rest-controller?messagesConversationId=" + groupId, true);
	xhttp.send();
}

function loadMessages() {
	var currentChatbox = document.getElementById("chat");
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var messages = JSON.parse(this.responseText);
			var chatbox = "";
			messages.forEach(msg => {
				try {
					chatbox += customLoadMessage(msg.username, msg.message);
				} catch (ex) {

				}
			});
			currentChatbox.innerHTML = chatbox;
			goLastestMsg();
		}
	};
	xhttp.open("GET", "http://" + window.location.host + "/chat-rest-controller?sender=" + username
		+ "&receiver=" + receiver, true);
	xhttp.send();
}

function customLoadMessage(sender, message) {
	var imgSrc = receiverAvatar;
	var msgDisplay = '<li>'
		+ '<div class="message';
	if (receiver != sender && username != sender) {
		return '';
	}
	else if (receiver == sender) {
		msgDisplay += '">';
	} else {
		imgSrc = userAvatar;
		msgDisplay += ' right">';
	}
	return msgDisplay + '<div class="message-img">'
		+ '<img src="' + imgSrc + '" alt="">'
		+ ' </div>'
		+ '<div class="message-text">' + message + '</div>'
		+ '</div>'
		+ '</li>';
}

function customLoadMessageGroup(sender, message){
	var imgSrc = receiverAvatar;
	var msgDisplay = '<li>'
		+ '<div class="message';
	if (username != sender) {
		msgDisplay += '">';
	} else {
		imgSrc = userAvatar;
		msgDisplay += ' right">';
	}
	return msgDisplay + '<div class="message-img">'
		+ '<img src="' + imgSrc + '" alt="">'
		+ ' </div>'
		+ '<div class="message-text">' + message + '</div>'
		+ '</div>'
		+ '</li>';
}

function searchFriendByKeyword(keyword) {
	fetch("http://" + window.location.host + "/users-rest-controller?username=" + username + "&keyword=" + keyword)
		.then(function(data) {
			return data.json();
		})
		.then(data => {
			document.querySelector(".list-user").innerHTML = "";
			data.forEach(function(data) {
				if (data.isOnline) status = "online";
				else status = "";

				let appendUser = '<li id="' + data.username + '" onclick="setReceiver(this);">'
					+ '<div class="user-contain">'
					+ '<div class="user-img">'
					+ '<img id="img-' + data.username + '"'
					+ ' src="http://' + window.location.host + '/files/' + data.username + '/' + data.avatar + '"'
					+ 'alt="Image of user">'
					+ '<div id="status-' + data.username + '" class="user-img-dot ' + status + '"></div>'
					+ '</div>'
					+ '<div class="user-info">'
					+ '<span class="user-name">' + data.username + '</span>'
					+ '<span'
					+ '</div>'
					+ '</div>'
					+ '</li>';
				document.querySelector(".list-user").innerHTML += appendUser;
			});
		});
}

function searchUser(ele) {
	if(typeChat == "user"){
		searchFriendByKeyword(ele.value);
	}else{
		console.log("Search Group by Keyword");
		//searchGroupByKeyword(ele.value);
	}
}

function goLastestMsg() {
	var msgLiTags = document.querySelectorAll(".message");
	var last = msgLiTags[msgLiTags.length - 1];
	try {
		last.scrollIntoView();
	} catch (ex) { }
}