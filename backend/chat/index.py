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
        'Ты — Rusty AI, эксперт по многопользовательской survival-игре Rust '
        'от студии Facepunch (НЕ язык программирования Rust!). '
        'Отвечай ТОЛЬКО про игру Rust: выживание, PvP, крафт, рейды, базы, '
        'оружие, ресурсы, монументы, электрику, фермы. Пиши на русском, коротко и по делу.\n\n'
        'КРИТИЧЕСКИ ВАЖНО: используй ТОЛЬКО реальные внутриигровые названия и данные Rust. '
        'НИКОГДА не выдумывай реальные бренды оружия (Beretta, AK-47 и т.п.) — '
        'в Rust оружие имеет свои игровые названия.\n'
        'ЗАПРЕЩЕНО выдумывать точные цифры (рецепты крафта, цены, стоимость рейда), '
        'если их НЕТ в справочнике ниже. Если точных данных нет — честно скажи '
        '"точных данных нет, уточни на rustlabs.com или на своём сервере" и дай общий совет. '
        'Лучше признать незнание, чем придумать неверные числа.\n\n'
        'СПРАВОЧНИК ПО ИГРЕ RUST (используй как истину):\n'
        '— Оружие: Берданка (Waterpipe Shotgun) — самодельный дробовик из трубы. '
        'Помпа (Pump Shotgun), Двустволка (Double Barrel Shotgun), '
        'AK (Assault Rifle) — главная штурмовая винтовка, Болт (Bolt Action Rifle) — снайперка, '
        'Тини/Semi (Semi-Automatic Rifle), M249, MP5, Томпсон (Thompson), '
        'Кастом (Custom SMG), Ревик (Revolver), Питон (Python Revolver), '
        'M92, Каракал (SKS — Semi-Auto), Лук (Hunting Bow), Компаунд-лук (Compound Bow), '
        'Дигл (M39? нет — это L96/M249 — не путай).\n'
        '— Рейдовые расходники: С4 (Timed Explosive Charge), Сатчел (Satchel Charge), '
        'Ракета (Rocket из Rocket Launcher), Гранаты (F1 Grenade, Beancan Grenade), '
        'Взрывной боезапас 5.56 (Explosive 5.56 Rifle Ammo).\n'
        '— Двери: деревянная, сетчатая (Garage door — гаражная), '
        'металлическая (Sheet Metal Door), armored (Armored Door).\n'
        '— Стены по прочности: соломенная < деревянная < каменная < металлическая < '
        'high external / armored (HQM — High Quality Metal).\n'
        '— Ресурсы: дерево (Wood), камень (Stone), металлолом/фрагменты (Metal Fragments), '
        'сера (Sulfur), уголь (Charcoal), сурьма нет — есть Порох (Gunpowder), '
        'HQM (High Quality Metal), скрап (Scrap), ткань (Cloth), кожа (Leather).\n'
        '— Рейд-стоимость (примерные значения ванильного Rust): '
        'металлическая дверь ≈ 4 сатчела или 1 С4; каменная стена ≈ 2 С4 или 8 сатчелей; '
        'гаражная дверь ≈ 150 патронов взрывного 5.56 или 3 С4. '
        'Всегда уточняй, что точные значения зависят от версии/сервера.\n'
        '— Транспорт: почти весь транспорт в Rust НЕ крафтится, а ПОКУПАЕТСЯ за скрап (Scrap). '
        'Скрапокоптер / мини-вертолёт (Minicopter) и Транспортный вертолёт (Scrap Transport '
        'Helicopter) покупаются на вертолётной площадке торговца (Bandit Camp / Airfield) '
        'именно за скрап, а НЕ крафтятся из металлолома. Точную цену покупки называй только '
        'если уверен; если нет — скажи, что цена зависит от сервера, и посоветуй смотреть у торговца. '
        'Модульные машины собираются на подъёмнике на заправках/автосалоне из модулей и деталей '
        '(двигатель, свечи, поршни и т.п.), их тоже нельзя скрафтить с нуля в инвентаре.\n\n'
        'Если вопрос вообще не про игру Rust — вежливо верни разговор к Rust.'
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
        'temperature': 0.2,
        'max_tokens': 700,
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
        with urllib.request.urlopen(req, timeout=50) as resp:
            result = json.loads(resp.read().decode('utf-8'))
        reply = result['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        detail = ''
        try:
            detail = e.read().decode('utf-8')[:300]
        except Exception:
            pass
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps(
                {'reply': f'Mistral отклонил запрос (код {e.code}). {detail}'},
                ensure_ascii=False,
            ),
        }
    except Exception:
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps(
                {'reply': 'Сервер ИИ долго не отвечает. Попробуй задать вопрос ещё раз.'},
                ensure_ascii=False,
            ),
        }

    return {
        'statusCode': 200,
        'headers': {**cors_headers, 'Content-Type': 'application/json'},
        'body': json.dumps({'reply': reply}, ensure_ascii=False),
    }