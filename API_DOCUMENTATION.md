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
  "description": "Laboratório 1",
  "last_seen": "2026-01-12T10:30:00Z",
  "status": "online"
}
```

**Resposta de Erro (404):**
```json
{
  "error": "Nó não encontrado"
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

**Resposta de Erro (404):**
```json
{
  "error": "Nó não encontrado"
}
```

**Nota:** 
- O campo `air_quality` pode ter os valores: `safe`, `warning`, `critical`, ou `unknown`
- Os valores dos sensores podem ser `null` se não houver leituras disponíveis

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
- `limit` (opcional, padrão: 100): Quantidade máxima de registros
- `offset` (opcional, padrão: 0): Paginação

**Resposta:**
```json
[
  { "node_id": 1, "value": 23.1, "ts": "2026-01-12T10:35:00Z" }
]
```

**Resposta de Erro (500):**
```json
{
  "error": "Erro ao buscar leituras"
}
```

### Umidade
```http
GET /api/readings/humidity?nodeId=1&limit=50&offset=0
```
**Parâmetros de Query:**
- `nodeId` (opcional): Filtrar por ID do nó
- `limit` (opcional, padrão: 100): Quantidade máxima de registros
- `offset` (opcional, padrão: 0): Paginação

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
**Parâmetros de Query:**
- `nodeId` (opcional): Filtrar por ID do nó
- `limit` (opcional, padrão: 100): Quantidade máxima de registros
- `offset` (opcional, padrão: 0): Paginação

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
- `nodeId` (opcional): ID do nó
- `gasType` (opcional): Tipo de gás (ex: mq2, mq135)
- `limit` (opcional, padrão: 100): Quantidade máxima de registros
- `offset` (opcional, padrão: 0): Paginação

**Resposta:**
```json
[
  { "node_id": 1, "value": 150, "ts": "2026-01-12T10:35:00Z", "type": "mq2" }
]
```

**Nota:** O campo `type` pode ser `null` se não puder ser inferido dos dados brutos.

### Obter últimas leituras de um nó
```http
GET /api/readings/:nodeId/latest
```
**Parâmetros:**
- `nodeId` (obrigatório): ID numérico do nó ou endereço MAC (ex: `AA:BB:CC:DD:EE:FF`)

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

**Resposta de Erro (404):**
```json
{
  "error": "Nó não encontrado"
}
```

**Notas:** 
- Esta rota aceita `nodeId` numérico ou o endereço MAC do dispositivo
- O array `gas` retorna as últimas 5 leituras de gás
- Os campos de leitura podem ser `null` se não houver dados disponíveis

---

## 📈 Endpoints de Analytics

### Obter média de leituras
```http
GET /api/analytics/average?nodeId=1&sensorType=temperature&startDate=2026-01-01&endDate=2026-01-12
```
**Parâmetros de Query:**
- `nodeId` (obrigatório): ID do nó
- `sensorType` (obrigatório): Tipo de sensor (`temperature`, `humidity`, `luminosity`, `gas`)
- `startDate` (opcional): Data inicial (formato ISO 8601)
- `endDate` (opcional): Data final (formato ISO 8601)

**Resposta:**
```json
{
  "average": 23.5,
  "min": 18.2,
  "max": 28.9,
  "count": 1523
}
```

**Resposta de Erro (400):**
```json
{
  "error": "nodeId e sensorType são obrigatórios"
}
```

### Obter estatísticas de um sensor
```http
GET /api/analytics/statistics?nodeId=1&sensorType=temperature&startDate=2026-01-01&endDate=2026-01-12
```
**Parâmetros de Query:**
- `nodeId` (obrigatório): ID do nó
- `sensorType` (obrigatório): Tipo de sensor (`temperature`, `humidity`, `luminosity`, `gas`)
- `startDate` (opcional): Data inicial (formato ISO 8601)
- `endDate` (opcional): Data final (formato ISO 8601)

**Resposta:**
```json
{
  "average": 23.5,
  "min": 18.2,
  "max": 28.9,
  "count": 1523,
  "stddev": 2.3,
  "variance": 5.29
}
```

**Resposta de Erro (400):**
```json
{
  "error": "nodeId e sensorType são obrigatórios"
}
```

**Resposta de Erro (500):**
```json
{
  "error": "Erro ao buscar estatísticas"
}
```

---

## 🔧 Códigos de Resposta

| Código | Descrição | Exemplo de Resposta |
|--------|-----------|---------------------|
| 200 | Sucesso | Dados solicitados retornados corretamente |
| 400 | Parâmetros inválidos ou obrigatórios faltando | `{ "error": "nodeId e sensorType são obrigatórios" }` |
| 404 | Recurso não encontrado | `{ "error": "Nó não encontrado" }` |
| 500 | Erro interno do servidor | `{ "error": "Erro ao buscar leituras" }` |

### Estrutura de Erro Padrão
Todos os erros seguem o formato:
```json
{
  "error": "Descrição do erro"
}
```

---

## 💡 Exemplos de Uso

### JavaScript/Fetch
```javascript
// Obter todos os nós
fetch('http://localhost:8000/api/nodes')
  .then(res => res.json())
  .then(data => console.log(data));

// Obter últimas leituras de um nó (por ID)
fetch('http://localhost:8000/api/readings/1/latest')
  .then(res => res.json())
  .then(data => console.log(data));

// Obter últimas leituras usando MAC address
fetch('http://localhost:8000/api/readings/AA:BB:CC:DD:EE:FF/latest')
  .then(res => res.json())
  .then(data => console.log(data));

// Resumo de status
fetch('http://localhost:8000/api/nodes/status/summary')
  .then(res => res.json())
  .then(data => console.log(data));

// Obter estatísticas de temperatura
fetch('http://localhost:8000/api/analytics/statistics?nodeId=1&sensorType=temperature')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

### Flutter/Dart
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List> getNodes() async {
  final response = await http.get(
    Uri.parse('http://localhost:8000/api/nodes')
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Erro ao carregar nós');
  }
}

Future<Map<String, dynamic>> getLatestReadings(String nodeId) async {
  final response = await http.get(
    Uri.parse('http://localhost:8000/api/readings/$nodeId/latest')
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else if (response.statusCode == 404) {
    throw Exception('Nó não encontrado');
  } else {
    throw Exception('Erro ao carregar leituras');
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
  .catch(error => {
    if (error.response) {
      console.error('Erro:', error.response.data.error);
    } else {
      console.error('Erro:', error.message);
    }
  });

// Obter média de leituras
api.get('/analytics/average', {
  params: {
    nodeId: 1,
    sensorType: 'temperature',
    startDate: '2026-01-01',
    endDate: '2026-01-12'
  }
})
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

---

## 📝 Notas

- A API retorna timestamps em formato ISO 8601 (ex: `2026-01-12T10:30:00Z`)
- Paginação está habilitada para grandes volumes de dados através dos parâmetros `limit` e `offset`
- Todos os endpoints suportam CORS para requisições do app mobile
- Dados são ordenados por timestamp em ordem decrescente (mais recentes primeiro)
- Campos `raw` não são retornados nas respostas da API REST
- Status de nó é determinado por `last_seen`: 
  - `online`: última visualização há menos de 5 minutos
  - `offline`: última visualização há mais de 5 minutos
- Qualidade do ar (`air_quality`) é calculada baseada nos valores de gás:
  - `safe`: valor < 100
  - `warning`: valor entre 100 e 300
  - `critical`: valor > 300
  - `unknown`: sem leitura disponível
- O endpoint `/api/readings/:nodeId/latest` aceita tanto ID numérico quanto endereço MAC
- O array `gas` em leituras mais recentes retorna as últimas 5 medições

---

## 🔄 Resumo de Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/nodes` | Lista todos os nós |
| GET | `/api/nodes/:id` | Detalhes de um nó |
| GET | `/api/nodes/:id/status` | Status atual do nó com sensores |
| GET | `/api/nodes/status/summary` | Resumo por localização |
| GET | `/api/readings/temperature` | Leituras de temperatura |
| GET | `/api/readings/humidity` | Leituras de umidade |
| GET | `/api/readings/luminosity` | Leituras de luminosidade |
| GET | `/api/readings/gas` | Leituras de gás |
| GET | `/api/readings/:nodeId/latest` | Últimas leituras (todos sensores) |
| GET | `/api/analytics/average` | Média de leituras |
| GET | `/api/analytics/statistics` | Estatísticas completas |
