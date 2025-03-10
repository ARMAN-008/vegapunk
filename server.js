const express = require('express');
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
    const bodyPayload = {
      model: 'llama3:latest', // Используем корректное значение
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150
    };

    // Используем глобальный fetch (доступен в Node.js v18+)
    const ollamaResponse = await fetch('https://ollama.degdarr.kz/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload)
    });

    const data = await ollamaResponse.json();

    // Извлекаем ответ из структуры ответа Ollama
    const responseText = (data.choices &&
                          data.choices.length > 0 &&
                          data.choices[0].message &&
                          data.choices[0].message.content)
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
