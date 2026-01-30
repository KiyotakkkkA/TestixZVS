<?php

return [
    'ollama' => [
        'base_url' => env('OLLAMA_BASE_URL', 'http://localhost:11434'),
        'model' => env('OLLAMA_MODEL'),
        'token' => env('OLLAMA_TOKEN'),
    ],
];
