/**
 * RARE 4N - Client Portal App
 * JavaScript for Client Portal
 */

let socket = null;
let clientId = null;
let clientName = null;
let clientPhone = null;
let clientEmail = null;
let isRecording = false;
let recognition = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Get client ID from URL
  const pathParts = window.location.pathname.split('/');
  clientId = pathParts[pathParts.length - 1] || `client_${Date.now()}`;

  // Initialize Web Speech API
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('widgetInput').value = transcript;
      document.getElementById('floatingInput').value = transcript;
      sendMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      updateWidgetStatus('?????? ???? ???????????? ?????? ??????????');
    };

    recognition.onend = () => {
      isRecording = false;
      updateVoiceButton();
    };
  }
});

// Register Client
function registerClient() {
  clientName = document.getElementById('clientName').value;
  clientPhone = document.getElementById('clientPhone').value;
  clientEmail = document.getElementById('clientEmail').value;

  if (!clientName || !clientPhone || !clientEmail) {
    alert('???????? ?????? ???????? ????????????');
    return;
  }

  // Connect to Socket.IO
  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
  socket = io(`${serverUrl}/client-portal`);

  socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('client:register', {
      clientId,
      clientName,
      phone: clientPhone,
      email: clientEmail,
    });
  });

  socket.on('client:registered', (data) => {
    if (data.success) {
      updateWidgetStatus('????????');
      enableWidget();
      loadRequests();
    }
  });

  socket.on('client:request:received', (data) => {
    addMessage('RARE', '???? ???????????? ???????? ??????????', 'assistant');
    loadRequests();
  });

  // ??? Voice-to-Voice response from ElevenLabs Agent
  socket.on('client:voice-response', async (data) => {
    const { transcription, response, audio, dialect, language } = data;
    
    // Show transcription
    addMessage('RARE', `[????????] ${transcription}`, 'assistant');
    
    // Show text response
    addMessage('RARE', response, 'assistant');
    
    // Play audio response
    if (audio) {
      const audioElement = new Audio(`data:audio/mpeg;base64,${audio}`);
      audioElement.play().catch(err => console.error('Audio play error:', err));
    }
    
    // Show dialect info
    if (dialect && dialect !== 'msa') {
      addMessage('RARE', `[????????????: ${dialect}]`, 'system');
    }
  });

  socket.on('client:request:updated', (data) => {
    addMessage('RARE', `???? ?????????? ???????? ????????: ${data.status}`, 'assistant');
    if (data.response) {
      addMessage('RARE', data.response, 'assistant');
    }
    
    // If payment is required, show payment button
    if (data.paymentRequired && data.amount) {
      showPaymentButton(data.requestId, data.amount, data.invoiceId);
    }
    
    loadRequests();
  });

  socket.on('client:payment:required', (data) => {
    addMessage('RARE', `???? ?????????????? ?????? ????????! ????????????: ${data.amount} ????????`, 'assistant');
    showPaymentButton(data.requestId, data.amount, data.invoiceId, data.paymentUrl);
    loadRequests();
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
    updateWidgetStatus('?????? ???? ??????????????');
  });

  // ??? Preview Libraries (Templates, Systems, Themes)
  socket.on('client:preview:libraries', (data) => {
    const { templates, systems, themes } = data;
    
    let previewMessage = '???? **???????????????? ??????????????:**\n\n';
    
    if (templates && templates.length > 0) {
      previewMessage += '???? **??????????????????:**\n';
      templates.slice(0, 5).forEach(template => {
        previewMessage += `- ${template.name}: ${template.description}\n`;
      });
      previewMessage += '\n';
    }
    
    if (systems && systems.length > 0) {
      previewMessage += '?????? **??????????????:**\n';
      systems.slice(0, 5).forEach(system => {
        previewMessage += `- ${system.name}: ${system.description}\n`;
      });
      previewMessage += '\n';
    }
    
    if (themes && themes.length > 0) {
      previewMessage += '???? **??????????????:**\n';
      themes.slice(0, 5).forEach(theme => {
        previewMessage += `- ${theme.name}: ${theme.description}\n`;
      });
    }
    
    addMessage('RARE', previewMessage, 'assistant');
  });

  // ??? Contact Information
  socket.on('client:contact-info', () => {
    addMessage('RARE', '???? **?????????????? ??????????????:**\n\n???? ????????????: +971529211077\n???? ????????????: GM@ZIEN-AI.APP\n\n?????????? ?????????????? ???????? ???? ???? ??????!', 'assistant');
  });
}

// Enable Widget
function enableWidget() {
  document.getElementById('widgetInput').disabled = false;
  document.getElementById('floatingInput').disabled = false;
  document.getElementById('voiceBtn').disabled = false;
  document.getElementById('sendBtn').disabled = false;
}

// Send Message
function sendMessage(text = null) {
  if (!socket || !socket.connected) {
    alert('???????? ?????????????? ??????????');
    return;
  }

  const input = document.getElementById('widgetInput');
  const floatingInput = document.getElementById('floatingInput');
  const message = text || input.value || floatingInput.value;

  if (!message.trim()) return;

  // Add user message to UI
  addMessage('??????', message, 'user');

  // Check if message is about libraries
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('????????????') || lowerMessage.includes('??????????????') || lowerMessage.includes('??????????') || lowerMessage.includes('??????????') || 
      lowerMessage.includes('libraries') || lowerMessage.includes('templates') || lowerMessage.includes('themes') || lowerMessage.includes('systems')) {
    // Request library preview
    socket.emit('client:preview-libraries', {
      type: 'all', // or 'templates', 'systems', 'themes'
    });
    addMessage('RARE', '???????? ?????????? ????????????????...', 'assistant');
  } else {
    // Send to server
    socket.emit('client:request', {
      type: 'text',
      content: message,
    });
  }

  // Clear input
  input.value = '';
  floatingInput.value = '';
}

// Send Floating Message
function sendFloatingMessage() {
  sendMessage();
}

// Toggle Voice (Voice-to-Voice with ElevenLabs Agent)
function toggleVoice() {
  if (!socket || !socket.connected) {
    alert('???????? ?????????????? ??????????');
    return;
  }

  if (isRecording) {
    // Stop recording
    if (recognition) {
      recognition.stop();
    }
    isRecording = false;
    updateWidgetStatus('????????');
  } else {
    // Start recording
    if (recognition) {
      recognition.start();
      isRecording = true;
      updateWidgetStatus('???????? ????????????????...');
    } else {
      // Use MediaRecorder for audio capture
      startAudioRecording();
    }
  }
  updateVoiceButton();
}

// Start audio recording for Voice-to-Voice
async function startAudioRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64Audio = reader.result.split(',')[1];
        
        // Send to server for Voice-to-Voice processing
        socket.emit('client:voice-request', {
          audio: base64Audio,
          language: 'ar', // Default Arabic, will be auto-detected
        });
        
        updateWidgetStatus('???????? ????????????????...');
      };
      
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorder.start();
    isRecording = true;
    updateWidgetStatus('???????? ??????????????...');

    // Stop after 5 seconds or when button clicked again
    setTimeout(() => {
      if (isRecording) {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
        isRecording = false;
        updateWidgetStatus('????????');
      }
    }, 5000);

    // Store for manual stop
    window.currentMediaRecorder = mediaRecorder;
    window.currentAudioStream = stream;
  } catch (error) {
    console.error('Audio recording error:', error);
    alert('?????? ?????? ???? ?????????????? ????????????');
    isRecording = false;
    updateWidgetStatus('????????');
  }
}

function toggleVoiceFloating() {
  toggleVoice();
}

function updateVoiceButton() {
  const btn = document.getElementById('voiceBtn');
  if (btn) {
    btn.style.bREMOVED = isRecording ? '#ff4444' : '#00eaff';
  }
}

// Add Message to Widget
function addMessage(sender, text, type) {
  const messagesDiv = document.getElementById('widgetMessages');
  const floatingMessagesDiv = document.getElementById('floatingMessages');

  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${type}`;
  messageDiv.innerHTML = `
    <strong>${sender}:</strong> ${text}
  `;

  if (messagesDiv) messagesDiv.appendChild(messageDiv);
  if (floatingMessagesDiv) floatingMessagesDiv.appendChild(messageDiv);

  // Scroll to bottom
  if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight;
  if (floatingMessagesDiv) floatingMessagesDiv.scrollTop = floatingMessagesDiv.scrollHeight;
}

// Update Widget Status
function updateWidgetStatus(status) {
  const statusEl = document.getElementById('widgetStatus');
  if (statusEl) {
    statusEl.textContent = status;
  }
}

// Handle File Select
let selectedFiles = [];

function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  selectedFiles = files;
  
  const previewDiv = document.getElementById('filePreview');
  previewDiv.innerHTML = '';
  
  files.forEach((file, index) => {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file-item';
    fileDiv.innerHTML = `
      <span>???? ${file.name} (${(file.size / 1024).toFixed(2)} KB)</span>
      <button onclick="removeFile(${index})" class="btn-remove">??</button>
    `;
    previewDiv.appendChild(fileDiv);
  });
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  const fileInput = document.getElementById('requestFiles');
  const dt = new DataTransfer();
  selectedFiles.forEach(file => dt.items.add(file));
  fileInput.files = dt.files;
  handleFileSelect({ target: { files: dt.files } });
}

// Submit Form
async function submitForm(event) {
  event.preventDefault();

  if (!socket || !socket.connected) {
    alert('???????? ?????????????? ??????????');
    return;
  }

  const requestType = document.getElementById('requestType').value;
  const requestDetails = document.getElementById('requestDetails').value;
  const themePreview = document.getElementById('themePreview').value;

  // Upload files if any
  let uploadedFileIds = [];
  if (selectedFiles.length > 0) {
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    formData.append('clientId', clientId);
    formData.append('clientName', clientName);

    try {
      const uploadResponse = await fetch('/api/client-portal/upload-files', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      if (uploadData.success) {
        uploadedFileIds = uploadData.fileIds || [];
      }
    } catch (error) {
      console.error('File upload error:', error);
    }
  }

  // Send form data
  fetch('/api/client-portal/form-submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId,
      clientName,
      phone: clientPhone,
      email: clientEmail,
      requestType,
      requestDetails,
      themePreview,
      fileIds: uploadedFileIds,
    }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('???? ?????????? ???????? ??????????');
        document.getElementById('requestForm').reset();
        selectedFiles = [];
        document.getElementById('filePreview').innerHTML = '';
        loadRequests();
      }
    })
    .catch(error => {
      console.error('Form submit error:', error);
      alert('?????? ?????? ???? ?????????? ??????????');
    });
}

// Load Requests
function loadRequests() {
  if (!clientId) return;

  fetch(`/api/client-portal/requests/${clientId}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        displayRequests(data.requests);
      }
    })
    .catch(error => {
      console.error('Load requests error:', error);
    });
}

// Display Requests
function displayRequests(requests) {
  const listDiv = document.getElementById('requestsList');
  if (!listDiv) return;

  if (requests.length === 0) {
    listDiv.innerHTML = '<p>???? ???????? ??????????</p>';
    return;
  }

  listDiv.innerHTML = requests.map(request => `
    <div class="request-item">
      <div class="request-header">
        <strong>${request.clientName}</strong>
        <span class="request-status status-${request.status}">${request.status}</span>
      </div>
      <div class="request-content">
        <p><strong>??????????:</strong> ${request.type}</p>
        <p><strong>??????????????:</strong> ${typeof request.content === 'string' ? request.content : JSON.stringify(request.content)}</p>
        <p><strong>??????????????:</strong> ${new Date(request.timestamp).toLocaleString('ar-SA')}</p>
        ${request.response ? `<p><strong>????????:</strong> ${request.response}</p>` : ''}
      </div>
    </div>
  `).join('');
}

// Toggle Floating Widget
function toggleFloatingWidget() {
  const widget = document.getElementById('floatingWidget');
  const content = document.getElementById('floatingWidgetContent');
  
  if (widget.style.display === 'none') {
    widget.style.display = 'block';
    content.style.display = 'block';
  } else {
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
  }
}

// Show Payment Button
function showPaymentButton(requestId, amount, invoiceId, paymentUrl = null) {
  const messagesDiv = document.getElementById('widgetMessages');
  const floatingMessagesDiv = document.getElementById('floatingMessages');

  const paymentDiv = document.createElement('div');
  paymentDiv.className = 'message message-payment';
  paymentDiv.innerHTML = `
    <div class="payment-notification">
      <strong>???? ?????? ??????????</strong>
      <p>????????????: ${amount} ????????</p>
      ${paymentUrl ? `
        <a href="${paymentUrl}" target="_blank" class="btn btn-payment">
          ???????? ????????
        </a>
      ` : `
        <button class="btn btn-payment" onclick="initiatePayment('${requestId}', ${amount}, '${invoiceId}')">
          ???????? ????????
        </button>
      `}
    </div>
  `;

  if (messagesDiv) messagesDiv.appendChild(paymentDiv);
  if (floatingMessagesDiv) floatingMessagesDiv.appendChild(paymentDiv);

  // Scroll to bottom
  if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight;
  if (floatingMessagesDiv) floatingMessagesDiv.scrollTop = floatingMessagesDiv.scrollHeight;
}

// Initiate Payment (Stripe + Apple Pay)
let stripe_KEY=REPLACE_ME
let stripe_KEY=REPLACE_ME
let paymentElement = null;

async function initiatePayment(requestId, amount, invoiceId) {
  try {
    // Initialize Stripe
    const STRIPE_KEY=REPLACE_ME
    if (!stripe) {
      stripe_KEY=REPLACE_ME
    }

    // Create Payment Intent
    const response = await fetch('/api/financial/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'sar',
        metadata: {
          requestId,
          invoiceId,
          clientId,
          clientName,
        },
      }),
    });

    const data = await response.json();
    
    if (data.success && data.clientSecret) {
      // Show payment section
      document.getElementById('paymentSection').style.display = 'block';
      
      // Initialize Stripe Elements
      const elements = stripe.elements({
        clientSecret: data.clientSecret,
        appearance: {
          theme: 'stripe',
        },
      });

      paymentElement = elements.create('payment', {
        paymentMethodTypes: ['card', 'apple_pay', 'google_pay'],
      });
      
      paymentElement.mount('#stripePayment');

      // Handle Apple Pay button
      if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
        document.getElementById('applePayBtn').style.display = 'block';
      }

      // Handle form submission
      const form = document.getElementById('paymentForm');
      if (form) {
        form.onsubmit = async (e) => {
          e.preventDefault();
          await confirmPayment(data.clientSecret, requestId);
        };
      }
    } else {
      // Fallback to checkout session
      const checkoutResponse = await fetch('/api/financial/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'SAR',
          metadata: {
            requestId,
            invoiceId,
            clientId,
            clientName,
          },
          successUrl: `${window.location.origin}/payment/success?request_id=${requestId}`,
          cancelUrl: `${window.location.origin}/payment/cancel?request_id=${requestId}`,
        }),
      });

      const checkoutData = await checkoutResponse.json();
      
      if (checkoutData.success && checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        alert('?????? ?????? ???? ?????????? ???????? ??????????');
      }
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    alert('?????? ?????? ???? ?????? ?????????? ??????????');
  }
}

// Confirm Payment
async function confirmPayment(clientSecret, requestId) {
  try {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements: stripeElements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?request_id=${requestId}`,
      },
    });

    if (error) {
      alert(`?????? ???? ??????????: ${error.message}`);
    } else {
      // Payment succeeded - notify server
      await fetch('/api/financial/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
        }),
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    alert('?????? ?????? ???? ?????????? ??????????');
  }
}

// Initiate Apple Pay
async function initiateApplePay() {
  try {
    const response = await fetch('/api/financial/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: parseFloat(document.querySelector('.payment-notification p').textContent.match(/\d+/)[0]),
        currency: 'sar',
        metadata: {
          requestId: document.querySelector('.payment-notification').dataset.requestId,
        },
      }),
    });

    const data = await response.json();
    
    if (data.success && data.clientSecret) {
      const paymentRequest = stripe.paymentRequest({
        country: 'SA',
        currency: 'sar',
        total: {
          label: 'RARE 4N Service',
          amount: Math.round(parseFloat(document.querySelector('.payment-notification p').textContent.match(/\d+/)[0]) * 100),
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      const elements = stripe.elements({ clientSecret: data.clientSecret });
      const prButton = elements.create('paymentRequestButton', {
        paymentRequest,
      });

      prButton.mount('#applePayBtn');
    }
  } catch (error) {
    console.error('Apple Pay initiation error:', error);
    alert('?????? ?????? ???? ?????? Apple Pay');
  }
}

// Preview Theme
function previewTheme(themeId) {
  if (!socket || !socket.connected) return;

  socket.emit('client:preview', {
    type: 'theme',
    themeId,
  });
}

// Request Libraries
function requestLibraries() {
  if (!socket || !socket.connected) {
    alert('???????? ?????????????? ??????????');
    return;
  }
  
  socket.emit('client:preview-libraries', {
    type: 'all',
  });
  addMessage('RARE', '???????? ?????????? ????????????????...', 'assistant');
}

// Request Contact Information
function requestContact() {
  if (!socket || !socket.connected) {
    alert('???????? ?????????????? ??????????');
    return;
  }
  
  socket.emit('client:contact-info');
}

// Make functions global for onclick handlers
window.initiatePayment = initiatePayment;
window.initiateApple_KEY=REPLACE_ME
window.requestLibraries = requestLibraries;
window.requestContact = requestContact;
window.handleFileSelect = handleFileSelect;
window.removeFile = removeFile;



