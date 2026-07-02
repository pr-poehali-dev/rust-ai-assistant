import json
import os
import urllib.request
import urllib.error


def handler(event: dict, context) -> dict:
    '''
    Business: Чат-помощник Rusty AI по игре Rust на базе Mistral AI.
    Args: event - dict с httpMethod, body (JSON с полем message и history)
          context - объект с request_id
    Returns: HTTP-ответ с полем reply (ответ ассистента)
    '''
    method: str = event.get('httpMethod', 'POST')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    api_key = os.environ.get('MISTRAL_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'MISTRAL_API_KEY is not set'}),
        }

    body_data = json.loads(event.get('body') or '{}')
    user_message = (body_data.get('message') or '').strip()
    history = body_data.get('history') or []

    if not user_message:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'message is required'}),
        }

    system_prompt = (
        'Ты — Rusty AI, дружелюбный и опытный помощник по компьютерной игре Rust '
        '(выживание, PvP, крафт, рейды, базы, оружие, мониторинг серверов). '
        'Отвечай только на вопросы по игре Rust. Пиши на русском языке, '
        'коротко, по делу и с конкретными советами. Если вопрос не про Rust — '
        'вежливо направь разговор обратно к игре Rust.'
    )

    messages = [{'role': 'system', 'content': system_prompt}]
    for item in history[-10:]:
        role = item.get('role')
        content = item.get('content')
        if role in ('user', 'assistant') and content:
            messages.append({'role': role, 'content': content})
    messages.append({'role': 'user', 'content': user_message})

    payload = json.dumps({
        'model': 'mistral-large-latest',
        'messages': messages,
        'temperature': 0.5,
        'max_tokens': 800,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.mistral.ai/v1/chat/completions',
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        },
        method='POST',
    )

    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            result = json.loads(resp.read().decode('utf-8'))
        reply = result['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        return {
            'statusCode': 502,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': f'Mistral API error: {e.code}'}),
        }

    return {
        'statusCode': 200,
        'headers': {**cors_headers, 'Content-Type': 'application/json'},
        'body': json.dumps({'reply': reply}, ensure_ascii=False),
    }
