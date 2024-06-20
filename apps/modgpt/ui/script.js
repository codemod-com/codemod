let form = document.getElementById('chatForm');
let messagesContainer = document.getElementById('messagesContainer');
let outputTextarea = document.getElementById('output');

function addMessage() {
	let newMessage = document.createElement('div');
	newMessage.className = 'message';
	newMessage.innerHTML = `
                <label>Role:
                    <select name="role">
                        <option value="system">System</option>
                        <option value="user">User</option>
                        <option value="assistant">Assistant</option>
                    </select>
                </label>
                <label>Content: <textarea name="content" required></textarea></label>
                <label>Name: <input type="text" name="name"></label>
            `;
	messagesContainer.appendChild(newMessage);
}

form.onsubmit = async function (event) {
	event.preventDefault();
	outputTextarea.value = ''; // Clear previous output
	let messages = Array.from(document.querySelectorAll('.message')).map(
		(message) => {
			return {
				role: message.querySelector('[name="role"]').value,
				content: message.querySelector('textarea[name="content"]')
					.value,
				name: message.querySelector('[name="name"]').value || undefined,
			};
		},
	);

	let engine = document.getElementById('engine').value;

	try {
		let response = await fetch('http://localhost:8082/sendChat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ messages, engine }),
		});

		let reader = response.body.getReader();
		let decoder = new TextDecoder('utf-8');

		function processStream() {
			return reader.read().then(({ done, value }) => {
				if (done) return;
				outputTextarea.value += decoder.decode(value, { stream: true });
				processStream();
			});
		}

		await processStream();
	} catch (error) {
		console.error('Error sending chat:', error);
		alert('Failed to send chat.');
	}
};
