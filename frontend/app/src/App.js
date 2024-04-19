import React, { useEffect, useState } from 'react';
import './App.css';

const emailsCollection = new Set();

function App() {
	const [emails, setEmails] = useState('');
	const [emailList, setEmailList] = useState([]);
	const [emailStatus, setEmailStatus] = useState({});
	
	useEffect(() => {
		fetchEmails().then(null);
		
		const eventSource = new EventSource('http://localhost:3001/emails/verification-status/sse');
		
		const updateEmailStatus = (event) => {
			const data = JSON.parse(event.data);
			setEmailStatus(prevStatus => ({
				...prevStatus,
				[data.id]: data.status
			}));
		}
		
		eventSource.addEventListener('email_verification', updateEmailStatus);
		
		return () => {
			eventSource.close();
		};
	}, []);
	
	const fetchEmails = async () => {
		try {
			const response = await fetch('http://localhost:3001/emails/list');
			const data = await response.json();
			
			if (data?.length) {
				const statuses = data.reduce((acc, curr) => {
					acc[curr.id] = curr.status;
					return acc;
				}, {});
				
				data.forEach((item) => {
					if (!emailsCollection.has(item.email)) {
						emailsCollection.add(item.email);
					}
				});
				
				setEmailList(data);
				setEmailStatus(statuses);
			}
		} catch (error) {
			console.error('Error:', error);
		}
	};
	
	const validateEmail = (email) => {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regex.test(email);
	};
	
	const handleSubmit = async () => {
		const emailsArray = emails.split(',')
			.map((email) => email.trim())
			.filter(email => !emailsCollection.has(email) && validateEmail(email));
		
		if (!emailsArray.length) {
			return;
		}
		
		const response = await fetch('http://localhost:3001/emails/bulk', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ emails: emailsArray })
		});
		
		if (response.status !== 200) {
			console.error(`Error: Failed to send emails. Reason: ${response.statusText}`);
			return;
		}
		
		const data = await response.json();
		emailsArray.forEach((email) => emailsCollection.add(email));
		setEmailList([...emailList, ...data]);
	};
	
	return (
		<div className="App">
			<div className="email-form">
        <textarea
	        value={emails}
	        onChange={e => setEmails(e.target.value)}
	        placeholder="Enter emails separated by commas"
        />
				<button onClick={handleSubmit}>Submit</button>
			</div>
			<div className="email-list">
				<table>
					<thead>
					<tr>
						<th>Email</th>
						<th>Status</th>
					</tr>
					</thead>
					<tbody>
						{emailList.map(({ id, email }) => (
							<tr key={id}>
								<td>{email}</td>
								<td>{emailStatus[id] || 'validating'}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default App;