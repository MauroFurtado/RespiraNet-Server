# 📱 API REST RespiraNet - Documentação

Esta API alimenta o app mobile do RespiraNet com dados dos sensores e status dos nós.

## 🚀 Base URL
```
http://localhost:8000
```

---

## 📍 Endpoints de Nós (Nodes)

### Listar todos os nós
```http
GET /api/nodes
```
**Resposta:**
```json
[
  {
    "id": 1,
    "mac": "AA:BB:CC:DD:EE:FF",
    "name": "Laboratório 1",
    "description": "Laboratório 1",
    "last_seen": "2026-01-12T10:30:00Z",
    "status": "online"
  }
]
```

### Obter detalhes de um nó específico
```http
GET /api/nodes/:id
```
**Parâmetros:**
- `id` (obrigatório): ID do nó

**Resposta:**
```json
{
  "id": 1,
  "mac": "AA:BB:CC:DD:EE:FF",
  "name": "Laboratório 1",
  "description": "Laboratório 1",
  "last_seen": "2026-01-12T10:30:00Z",
  "status": "online"
}
```

### Obter status atual de um nó
```http
GET /api/nodes/:id/status
```
**Resposta:**
```json
{
  "id": 1,
  "mac": "AA:BB:CC:DD:EE:FF",
  "name": "Laboratório 1",
  "description": "Laboratório 1",
  "last_seen": "2026-01-12T10:30:00Z",
  "status": "online",
  "air_quality": "safe",
  "sensors": {
    "temperature": { "value": 22.5, "ts": "2026-01-12T10:30:00Z" },
    "humidity": { "value": 65.3, "ts": "2026-01-12T10:30:00Z" },
    "luminosity": { "value": 450, "ts": "2026-01-12T10:30:00Z" },
    "gas": { "value": 150, "ts": "2026-01-12T10:30:00Z", "type": "mq2" }
  }
}
```

### Resumo de status por localização
```http
GET /api/nodes/status/summary
```
**Resposta:**
```json
{
  "total_nodes": 10,
  "online_nodes": 8,
  "offline_nodes": 2,
  "locations": [
    { "location": "Laboratório 1", "total": 5, "online": 4, "offline": 1 },
    { "location": "Corredor", "total": 5, "online": 4, "offline": 1 }
  ]
}
```

---

## 📊 Endpoints de Leituras (Readings)

### Temperatura
```http
GET /api/readings/temperature?nodeId=1&limit=50&offset=0
```
**Parâmetros de Query:**
- `nodeId` (opcional): Filtrar por ID do nó
- `limit` (padrão: 100): Quantidade máxima de registros
- `offset` (padrão: 0): Paginação
**Resposta:**
```json
[
  { "node_id": 1, "value": 23.1, "ts": "2026-01-12T10:35:00Z" }
]
```

### Umidade
```http
GET /api/readings/humidity?nodeId=1&limit=50&offset=0
```
Mesmos parâmetros que temperatura.
**Resposta:**
```json
[
  { "node_id": 1, "value": 64.8, "ts": "2026-01-12T10:35:00Z" }
]
```

### Luminosidade
```http
GET /api/readings/luminosity?nodeId=1&limit=50&offset=0
```
Mesmos parâmetros que temperatura.
**Resposta:**
```json
[
  { "node_id": 1, "value": 455, "ts": "2026-01-12T10:35:00Z" }
]
```

### Obter leituras de gases
```http
GET /api/readings/gas?nodeId=1&gasType=mq2&limit=50&offset=0
```
**Parâmetros de Query:**
- `nodeId` (obrigatório): ID do nó
- `gasType` (opcional): Tipo de gás (ex: mq2, mq135)
- `limit` (padrão: 100)
- `offset` (padrão: 0)
**Resposta:**
```json
[
  { "node_id": 1, "value": 150, "ts": "2026-01-12T10:35:00Z", "type": "mq2" }
]
```

### Obter últimas leituras de um nó
```http
GET /api/readings/:nodeId/latest
```
**Resposta (combina todos os sensores):**
```json
{
  "nodeId": 1,
  "mac": "AA:BB:CC:DD:EE:FF",
  "timestamp": "2026-01-12T10:35:00Z",
  "readings": {
    "temperature": {
      "value": 23.1,
      "ts": "2026-01-12T10:35:00Z"
    },
    "humidity": {
      "value": 64.8,
      "ts": "2026-01-12T10:35:00Z"
    },
    "luminosity": {
      "value": 455,
      "ts": "2026-01-12T10:35:00Z"
    },
    "gas": [
      { "value": 150, "ts": "2026-01-12T10:35:00Z", "type": "mq2" }
    ]
  }
}
```
Observação: esta rota aceita `nodeId` numérico ou o MAC do dispositivo (ex.: `AA:BB:CC:DD:EE:FF`).

---

## 📈 Observações sobre Analytics

Os endpoints de analytics foram removidos nesta versão para simplificar a API utilizada pelo app.

---

## 🔧 Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Parâmetros inválidos ou obrigatórios faltando |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

---

## 💡 Exemplos de Uso

### JavaScript/Fetch
```javascript
// Obter todos os nós
fetch('http://localhost:8000/api/nodes')
  .then(res => res.json())
  .then(data => console.log(data));

// Obter últimas leituras de um nó
fetch('http://localhost:8000/api/readings/1/latest')
  .then(res => res.json())
  .then(data => console.log(data));

// Resumo de status
fetch('http://localhost:8000/api/nodes/status/summary')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Flutter/Dart
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List> getNodes() async {
  final response = await http.get(
    Uri.parse('http://localhost:3000/api/nodes')
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Erro ao carregar nós');
  }
}
```

### React Native
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

// Obter status de um nó
api.get(`/nodes/1/status`)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

---

## 📝 Notas

- A API retorna timestamps em formato ISO 8601
- Paginação está habilitada para grandes volumes de dados (onde aplicável)
- Todos os endpoints suportam CORS para requisições do app mobile
- Dados são ordenados por timestamp em ordem decrescente (mais recentes primeiro)
- Campos `raw` não são retornados nas respostas
