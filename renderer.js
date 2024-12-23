document.getElementById('addConfig').addEventListener('click', () => {
  const container = document.getElementById('configurations');
  const newConfig = document.createElement('div');
  newConfig.classList.add('response-config');

  newConfig.innerHTML = `
      <label for="trigger">Gatilho:</label>
      <input type="text" class="trigger" placeholder="Digite o gatilho (ex: oi)">

      <label for="message">Mensagem:</label>
      <textarea class="message" rows="2" placeholder="Digite a mensagem de resposta"></textarea>

      <label for="audio">Áudio:</label>
      <input type="file" class="audio" accept="audio/*">
  `;

  container.appendChild(newConfig);
});

document.getElementById('saveConfig').addEventListener('click', () => {
  const responses = [];
  document.querySelectorAll('.response-config').forEach((config) => {
      const trigger = config.querySelector('.trigger').value;
      const message = config.querySelector('.message').value;
      const audioInput = config.querySelector('.audio');
      const fileName = audioInput.files.length > 0 ? audioInput.files[0].name : null;

      if (trigger) {
          if (message) {
              responses.push({ trigger, message, type: 'text' });
          }
          if (fileName) {
              responses.push({ trigger, fileName, type: 'audio' });
          }
      }
  });

  // Envia as configurações para o backend via Electron
  window.electron.send('save-config', { responses });
});
