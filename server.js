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
    // Формируем тело запроса в соответствии с ожидаемым форматом
    const bodyPayload = {
      model: 'llama3.3:latest', // или используйте нужную модель, например "llama3:latest"
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 150  // при необходимости можно увеличить/уменьшить
    };

    // Отправляем POST-запрос к Ollama
    const ollamaResponse = await fetch('https://ollama.degdarr.kz/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });

    const data = await ollamaResponse.json();

    // Извлекаем ответ из data.choices, если он есть
    const responseText = (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content)
      ? data.choices[0].message.content
      : "No response received";

    res.json({ response: responseText });
  } catch (error) {
    console.error('Error communicating with Ollama:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
