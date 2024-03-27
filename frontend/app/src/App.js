import React, { useEffect, useState } from 'react';
import './App.css';

const emailsCollection = new Set();

function App() {
	const [emails, setEmails] = useState('');
	const [emailList, setEmailList] = useState([]);
	const [emailStatus, setEmailStatus] = useState({});
	
	useEffect(() => {
		fetchEmails().then(null);
		
		const eventSource = new EventSource('http://localhost:3001/email-verification-status/sse');
		
		const updateEmailStatus = (event) => {
			const data = JSON.parse(event.data);
			setEmailStatus(prevStatus => ({
				...prevStatus,
				[data.id]: data.status
			}));
		}
		
		eventSource.addEventListener('email_verification', updateEmailStatus);
		
		return () => {
			eventSource.removeEventListener('email_verification', updateEmailStatus);
			eventSource.close();
		};
	}, []);
	
	const fetchEmails = async () => {
		try {
			const response = await fetch('http://localhost:3001/emails');
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
		
		if (emailsArray.length) {
			try {
				const response = await fetch('http://localhost:3001/emails/bulk', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ emails: emailsArray })
				});
				
				if (response.status !== 200) {
					console.error(`Error: Failed to send emails. Reason: ${response.statusText}`);
				} else {
					const data = await response.json();
					
					emailsArray.forEach((email) => emailsCollection.add(email));
					
					setEmailList([...emailList, ...data]);
				}
			} catch (error) {
				console.error('Failed to send emails');
				console.error('Error:', error);
			}
		} else {
			console.error('No valid emails to send');
		}
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

//121@test.com, 122@test.com, 123@test.com, 124@test.com, 125@test.com, 126@test.com, 127@test.com, 128@test.com, 129@test.com, 130@test.com