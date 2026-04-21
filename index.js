const API_KEY = "AIzaSyA9iaHTAPqLTN7XpAcpab0qPPeMEk0GAiI";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

let currentUser = null;

async function callGeminiAPI(prompt) {
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                    topP: 0.95,
                    topK: 40
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return null;
    }
}

function buildBCAPrompt(userMessage) {
    return `You are an expert AI Exam Preparation Tutor specializing in BCA (Bachelor of Computer Applications) curriculum.

Your role: Help BCA students prepare for exams by explaining concepts clearly, providing examples, and offering exam-focused guidance.

Topics you cover:
- Programming Languages (C, C++, Java, Python)
- Data Structures and Algorithms
- Database Management Systems (DBMS) and SQL
- Operating Systems
- Computer Networks
- Software Engineering and SDLC
- Web Technologies (HTML, CSS, JavaScript, PHP)
- Mathematics for Computing
- Object Oriented Programming (OOP) in python
- Agile software development Life cycle
- New age life skills

Instructions for response:
- Answer concisely but thoroughly for exam preparation
- Use bullet points for better readability
- Include relevant code examples where applicable
- Highlight important exam points
- Keep tone friendly, encouraging, and academic
- Focus on BCA syllabus relevance

Student's question: "${userMessage}"

Provide a detailed, accurate, and exam-focused BCA answer and also don't include asterisk (*) sign in the answer:`;
}

async function getMockResponse(question) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const lowerQ = question.toLowerCase();
    
    if (lowerQ.includes('oop') || lowerQ.includes('object oriented')) {
        return "**Object Oriented Programming (OOP) Concepts - BCA Exam Focus:**\n\n**1. Encapsulation:** Wrapping data and methods into a single unit (class). Example: A BankAccount class with private balance variable and public methods to deposit/withdraw.\n\n**2. Inheritance:** Creating new classes from existing ones. Example: Student class inheriting from Person class.\n\n**3. Polymorphism:** One interface, multiple implementations. Example: Method overloading and overriding.\n\n**4. Abstraction:** Hiding implementation details. Example: Abstract classes and interfaces.\n\n**Exam Tip:** These four concepts are fundamental to OOP and frequently asked in BCA exams. Remember to provide real-world examples!";
    } 
    else if (lowerQ.includes('dbms') || lowerQ.includes('normalization') || lowerQ.includes('sql')) {
        return "**Database Management System (DBMS) - Key Topics for BCA Exam:**\n\n**Normalization Forms:**\n• 1NF: Eliminate repeating groups, atomic values\n• 2NF: Remove partial dependencies\n• 3NF: Remove transitive dependencies\n• BCNF: Advanced normalization\n\n**Important SQL Commands:**\n```sql\nSELECT * FROM Students WHERE grade='A';\nINSERT INTO Courses VALUES (101, 'DBMS', 4);\nUPDATE Students SET grade='B' WHERE id=5;\nDELETE FROM Students WHERE id=10;\n```\n\n**ACID Properties:** Atomicity, Consistency, Isolation, Durability\n\n**Exam Tip:** Practice writing SQL queries and understand normalization with examples!";
    }
    else if (lowerQ.includes('network') || lowerQ.includes('osi') || lowerQ.includes('tcp')) {
        return "**Computer Networks - OSI and TCP/IP Models for BCA Exam:**\n\n**OSI Model (7 Layers):**\n1. Physical Layer\n2. Data Link Layer\n3. Network Layer\n4. Transport Layer\n5. Session Layer\n6. Presentation Layer\n7. Application Layer\n\n**TCP/IP Model (4 Layers):**\n- Network Interface Layer\n- Internet Layer (IP)\n- Transport Layer (TCP/UDP)\n- Application Layer\n\n**Key Differences:** OSI is theoretical (7 layers), TCP/IP is practical (4 layers). TCP is connection-oriented, UDP is connectionless.\n\n**Exam Tip:** Remember the layer order and functions of each layer for exams!";
    }
    else if (lowerQ.includes('data structure') || lowerQ.includes('stack') || lowerQ.includes('queue')) {
        return "**Data Structures - Important for BCA Exams:**\n\n**Stack (LIFO - Last In First Out):**\n- Operations: push(), pop(), peek(), isEmpty()\n- Applications: Expression evaluation, undo/redo, recursion\n\n**Queue (FIFO - First In First Out):**\n- Operations: enqueue(), dequeue(), front(), isEmpty()\n- Applications: Scheduling, BFS algorithm\n\n**Linked List:** Dynamic data structure with nodes containing data and pointer to next node.\n\n**Sorting Algorithms:**\n- Bubble Sort: O(n²)\n- Merge Sort: O(n log n)\n- Quick Sort: O(n log n) average\n\n**Exam Tip:** Understand time complexity and practice implementing these data structures!";
    }
    else {
        return "**BCA Curriculum Overview:**\n\nBased on your question, here are key BCA subjects to focus on:\n\n**Core Subjects:**\n• Programming (C, C++, Java, Python)\n• Database Management Systems (DBMS)\n• Data Structures & Algorithms\n• Operating Systems\n• Computer Networks\n• Software Engineering\n• Web Development\n\n**Study Tips:**\n1. Practice coding regularly\n2. Understand theoretical concepts with examples\n3. Solve previous year exam papers\n4. Create concise notes for revision\n\nCould you specify which topic you'd like to explore in more detail? Examples:\n- \"Explain pointers in C\"\n- \"What is deadlock in OS?\"\n- \"Explain JOIN operations in SQL\"";
    }
}

async function getAIResponse(userMessage) {
    try {
        const prompt = buildBCAPrompt(userMessage);
        const response = await callGeminiAPI(prompt);
        
        if (response && response.trim().length > 0) {
            return response.trim();
        } else {
            return await getMockResponse(userMessage);
        }
    } catch (error) {
        console.error("Error getting AI response:", error);
        return await getMockResponse(userMessage) + "\n\n*(Note: Using offline response mode)*";
    }
}

function addMessage(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(role === 'user' ? 'user-message' : 'ai-message');
    
    const icon = role === 'user' ? '👤' : '🤖';
    let formattedContent = content.replace(/\n/g, '<br>');
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedContent = formattedContent.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
    formattedContent = formattedContent.replace(/`(.*?)`/g, '<code>$1</code>');
    
    messageDiv.innerHTML = `
        <div class="d-flex align-items-start">
            <div class="flex-shrink-0 me-2" style="font-size: 1.2rem;">${icon}</div>
            <div class="flex-grow-1" style="white-space: pre-line;">${formattedContent}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'block';
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'none';
}

async function sendUserQuestion(questionText) {
    if (!questionText.trim()) return;
    
    const sendBtn = document.getElementById('sendBtn');
    const userQuestion = document.getElementById('userQuestion');
    
    sendBtn.disabled = true;
    userQuestion.value = '';
    addMessage('user', questionText);
    showTyping();
    
    try {
        const aiResponse = await getAIResponse(questionText);
        hideTyping();
        addMessage('ai', aiResponse);
    } catch (error) {
        hideTyping();
        addMessage('ai', "⚠️ Sorry, I'm having trouble connecting. Please try again!");
        console.error(error);
    } finally {
        sendBtn.disabled = false;
        userQuestion.focus();
    }
}

function initChatHistory() {
    const chatMessages = document.getElementById('chatMessages');
    const userName = document.getElementById('displayUserName')?.innerText || "Student";
    
    chatMessages.innerHTML = '';
    
    const welcomeMessage = `✨ Hello **${userName}**! I'm your AI Exam Preparation Tutor for **BCA Curriculum**.\n\nI can help you with:\n• Programming (C, C++, Java, Python)\n• Database Management Systems (DBMS) & SQL\n• Computer Networks & OSI Model\n• Data Structures & Algorithms\n• Operating Systems\n• Software Engineering & Web Development\n\n**Ask me any BCA exam question or click on a topic above!** 🚀`;
    
    const welcomeDiv = document.createElement('div');
    welcomeDiv.classList.add('ai-message');
    welcomeDiv.innerHTML = `
        <div class="d-flex align-items-start">
            <div class="flex-shrink-0 me-2" style="font-size: 1.2rem;">🎓</div>
            <div class="flex-grow-1">${welcomeMessage.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
        </div>
    `;
    chatMessages.appendChild(welcomeDiv);
}

function onLoginSuccess(name, email) {
    currentUser = { name, email };
    document.getElementById('displayUserName').innerText = name;
    
    const loginSection = document.getElementById('loginSection');
    const tutorSection = document.getElementById('tutorSection');
    
    loginSection.style.display = 'none';
    tutorSection.style.display = 'block';
    
    initChatHistory();
    document.getElementById('userQuestion').focus();
}

function logout() {
    currentUser = null;
    const loginSection = document.getElementById('loginSection');
    const tutorSection = document.getElementById('tutorSection');
    
    tutorSection.style.display = 'none';
    loginSection.style.display = 'block';
    
    document.getElementById('loginName').value = '';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('loginName').value.trim();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    onLoginSuccess(name, email);
});

document.getElementById('logoutBtn').addEventListener('click', logout);

document.getElementById('sendBtn').addEventListener('click', () => {
    const question = document.getElementById('userQuestion').value.trim();
    if (question) sendUserQuestion(question);
});

document.getElementById('userQuestion').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const question = document.getElementById('userQuestion').value.trim();
        if (question) sendUserQuestion(question);
    }
});

document.querySelectorAll('.badge-subject').forEach(badge => {
    badge.addEventListener('click', () => {
        const topic = badge.getAttribute('data-topic');
        if (topic) {
            sendUserQuestion(topic);
            badge.classList.add('active');
            setTimeout(() => badge.classList.remove('active'), 500);
        }
    });
});

