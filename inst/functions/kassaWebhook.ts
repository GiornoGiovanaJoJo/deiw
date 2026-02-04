import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  // Только POST запросы
  if (req.method !== 'POST') {
    return Response.json({ error: 'Only POST allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    
    // Получить API ключ из заголовков
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey) {
      return Response.json({ error: 'API key required' }, { status: 401 });
    }

    // Проверить API ключ и найти кассу
    const kassas = await base44.asServiceRole.entities.Kassa.filter({ api_key: apiKey });
    
    if (kassas.length === 0) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const kassa = kassas[0];
    
    // Получить данные о продаже
    const body = await req.json();
    const { ware_id, количество, сумма } = body;

    if (!ware_id || !количество) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Найти товар
    const wares = await base44.asServiceRole.entities.Ware.filter({ id: ware_id });
    if (wares.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const ware = wares[0];

    // Уменьшить количество товара
    const новое_количество = Math.max(0, (ware.bestand || 0) - количество);
    const нужна_закупка = новое_количество < (ware.mindestbestand || 0);

    // Обновить товар
    await base44.asServiceRole.entities.Ware.update(ware_id, {
      bestand: новое_количество
    });

    // Создать запись о продаже
    const kassSale = await base44.asServiceRole.entities.KassaSale.create({
      kassa_id: kassa.id,
      kassa_name: kassa.name,
      ware_id: ware_id,
      ware_name: ware.name,
      количество: количество,
      сумма: сумма || (количество * (ware.verkaufspreis || 0)),
      дата: new Date().toISOString(),
      статус: 'Обработана',
      уменьшено_количество: true,
      нужна_закупка: нужна_закупка
    });

    // Обновить время последней синхронизации кассы
    await base44.asServiceRole.entities.Kassa.update(kassa.id, {
      последняя_синхронизация: new Date().toISOString(),
      status: 'Подключена'
    });

    // Создать запись в WarenLog для статистики продаж
    await base44.asServiceRole.entities.WarenLog.create({
      ware_id: ware_id,
      ware_name: ware.name,
      benutzer_id: 'system_kassa',
      benutzer_name: `Касса: ${kassa.name}`,
      aktion: 'Verkauf',
      menge: количество,
      notiz: `Verkauf über Kassa ${kassa.name} (${kassa.kassa_nummer}): ${количество} ${ware.einheit} von ${ware.name} verkauft. Bestand: ${ware.bestand || 0} → ${новое_количество}${нужна_закупка ? ' [NACHBESTELLUNG ERFORDERLICH]' : ''}`,
      datum: new Date().toISOString()
    });

    return Response.json({
      success: true,
      message: 'Sale recorded',
      new_quantity: новое_количество,
      needs_purchase: нужна_закупка,
      sale_id: kassSale.id
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});