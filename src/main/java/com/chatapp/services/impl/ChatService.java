package com.chatapp.services.impl;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.HashSet;
import java.util.Queue;
import java.util.Set;

import javax.websocket.EncodeException;

import com.chatapp.models.FileDTO;
import com.chatapp.models.Message;
import com.chatapp.services.ChatServiceAbstract;
import com.chatapp.services.FileServiceAbstract;
import com.chatapp.websockets.ChatWebsocket;

public class ChatService extends ChatServiceAbstract{

	private static ChatService chatService = null;

	private ChatService() {
	}

	public synchronized static ChatService getInstance() {
		if (chatService == null) {
			chatService = new ChatService();
		}
		return chatService;
	}

	@Override
	public boolean register(ChatWebsocket chatWebsocket) {
		return chatWebsockets.add(chatWebsocket);
	}

	@Override
	public boolean close(ChatWebsocket chatWebsocket) {
		return chatWebsockets.remove(chatWebsocket);
	}

	@Override
	public void sendMessageToAllUsers(Message message) {
		message.setOnlineList(getUsernames());
		chatWebsockets.stream().forEach(chatWebsocket -> {
			try {
				chatWebsocket.getSession().getBasicRemote().sendObject(message);
			} catch (IOException | EncodeException e) {
				e.printStackTrace();
			}
		});
	}

	@Override
	public void sendMessageToOneUser(Message message, Queue<FileDTO> fileDTOs) {
		if (!message.getType().equals("text")) {
			String fileName = message.getMessage();
			fileName = fileName.replaceAll("\\s+", "");
			String destFile = FileServiceAbstract.rootLocation.toString() + "/" + message.getUsername() + "/" + fileName;
			File uploadedFile = new File(destFile);
			if (!uploadedFile.exists()) {
				try {
					FileOutputStream fileOutputStream = new FileOutputStream(uploadedFile);
					String sender = message.getUsername();
					String receiver = message.getReceiver();
					String url = FileServiceAbstract.rootURL + sender + "/" + fileName;
					FileDTO newFileDTO = new FileDTO(fileName, fileOutputStream, sender, receiver, url);
					fileDTOs.add(newFileDTO);
				} catch (FileNotFoundException ex) {
					ex.printStackTrace();
				}
			}
		} else {
			chatWebsockets.stream().filter(chatWebsocket -> chatWebsocket.getUsername().equals(message.getReceiver()))
					.forEach(chatWebsocket -> {
						try {
							chatWebsocket.getSession().getBasicRemote().sendObject(message);
						} catch (IOException | EncodeException e) {
							e.printStackTrace();
						}
					});
		}
	}

	@Override
	public void handleFileUpload(ByteBuffer byteBuffer, boolean last, Queue<FileDTO> fileDTOs) {
		try {
			if (!last) {
				while (byteBuffer.hasRemaining()) {
					fileDTOs.peek().getFileOutputStream().write(byteBuffer.get());
				}
			} else {
				fileDTOs.peek().getFileOutputStream().flush();
				fileDTOs.peek().getFileOutputStream().close();
				System.out
						.println("Done: " + fileDTOs.peek().getFilename() + " of user: " + fileDTOs.peek().getSender());
				String message = fileDTOs.peek().getUrl();
				String type = "text";
				String username = fileDTOs.peek().getSender();
				String receiver = fileDTOs.peek().getReceiver();
				Message messageResponse = new Message(username, message, type, receiver);
				fileDTOs.remove();
				sendMessageToOneUser(messageResponse, fileDTOs);
			}

		} catch (IOException ex) {
			System.out.println(ex.getMessage());
			ex.printStackTrace();
		}
	}

	@Override
	protected Set<String> getUsernames() {
		Set<String> usernames = new HashSet<String>();
		chatWebsockets.forEach(chatWebsocket -> {
			usernames.add(chatWebsocket.getUsername());
		});
		return usernames;
	}
}