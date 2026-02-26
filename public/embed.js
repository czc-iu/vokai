(function() {
  const config = window.TOMYBOT_CONFIG || {};
  const baseUrl = config.baseUrl || window.location.origin;
  const apiKey = config.apiKey || '';
  const theme = config.theme || 'purple';
  const position = config.position || 'bottom-right';
  const locale = config.locale || navigator.language || 'zh';
  
  const styles = {
    'bottom-right': 'bottom: 20px; right: 20px;',
    'bottom-left': 'bottom: 20px; left: 20px;',
  };
  
  const buttonColors = {
    'purple': 'background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);',
    'blue': 'background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);',
    'green': 'background: linear-gradient(135deg, #10B981 0%, #059669 100%);',
  };

  const container = document.createElement('div');
  container.id = 'tomybot-widget';
  container.innerHTML = `
    <style>
      #tomybot-widget * {
        box-sizing: border-box;
      }
      #tomybot-button {
        position: fixed;
        ${styles[position] || styles['bottom-right']}
        width: 60px;
        height: 60px;
        border-radius: 50%;
        ${buttonColors[theme] || buttonColors['purple']}
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      #tomybot-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 30px rgba(139, 92, 246, 0.6);
      }
      #tomybot-button svg {
        width: 28px;
        height: 28px;
        fill: white;
      }
      #tomybot-modal {
        position: fixed;
        ${styles[position] || styles['bottom-right']}
        bottom: 90px;
        width: 380px;
        height: 600px;
        max-height: 80vh;
        border-radius: 16px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.2);
        z-index: 999998;
        display: none;
        overflow: hidden;
        background: white;
      }
      #tomybot-modal.open {
        display: block;
        animation: tomybot-slide-up 0.3s ease;
      }
      #tomybot-iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
      @keyframes tomybot-slide-up {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @media (max-width: 480px) {
        #tomybot-modal {
          width: 100%;
          height: 100%;
          max-height: 100%;
          bottom: 0;
          right: 0;
          left: 0;
          border-radius: 0;
        }
        #tomybot-button {
          bottom: 20px;
          right: 20px;
        }
      }
    </style>
    <button id="tomybot-button" aria-label="Open TomyBot Chat">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
    </button>
    <div id="tomybot-modal">
      <iframe id="tomybot-iframe" allow="microphone; camera"></iframe>
    </div>
  `;
  
  document.body.appendChild(container);
  
  const button = document.getElementById('tomybot-button');
  const modal = document.getElementById('tomybot-modal');
  const iframe = document.getElementById('tomybot-iframe');
  
  let isOpen = false;
  
  button.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      const iframeUrl = `${baseUrl}/embed?apiKey=${encodeURIComponent(apiKey)}&theme=${theme}&locale=${locale}`;
      if (iframe.src !== iframeUrl) {
        iframe.src = iframeUrl;
      }
      modal.classList.add('open');
    } else {
      modal.classList.remove('open');
    }
  });
  
  window.addEventListener('message', (event) => {
    if (event.data === 'tomybot-close') {
      isOpen = false;
      modal.classList.remove('open');
    }
  });
})();
