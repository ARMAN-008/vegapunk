// server.js
const express = require('express');
const fetch = require('node-fetch'); // Если Node.js v18+, можно использовать встроенный fetch
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Для работы с JSON
app.use(express.json());
// Отдаем статические файлы из папки public
app.use(express.static(path.join(__dirname, 'public')));

// API-прокси: принимает запросы от клиента и отправляет их на сервер Ollama
app.post('/api/chat', async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Отправка POST-запроса к Ollama (проверьте, что ваш Ollama запущен и доступен по этому адресу)
    const ollamaResponse = await fetch('http://localhost:11434/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.3:latest', // или другая модель, которую вы используете
        prompt: prompt
      })
    });

    const data = await ollamaResponse.json();
    // Предполагаем, что ответ от Ollama находится в data.response; адаптируйте, если структура другая
    res.json({ response: data.response || "No response received" });
  } catch (error) {
    console.error('Error communicating with Ollama:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
