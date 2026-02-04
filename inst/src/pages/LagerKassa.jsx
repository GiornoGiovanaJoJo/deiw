import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function LagerKassa() {
  const [kassas, setKassas] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewKassa, setShowNewKassa] = useState(false);
  const [newKassaName, setNewKassaName] = useState("");
  const [newKassaNummer, setNewKassaNummer] = useState("");
  const [selectedKassa, setSelectedKassa] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kassasData, salesData] = await Promise.all([
        base44.entities.Kassa.list(),
        base44.entities.KassaSale.list('-дата', 100)
      ]);
      setKassas(kassasData);
      setSales(salesData);
    } catch (error) {
      toast.error("Ошибка загрузки данных");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Вычислить статистику
  const totalSales = sales.length;
  const totalAmount = sales.reduce((sum, sale) => sum + (sale.сумма || 0), 0);
  const totalQuantity = sales.reduce((sum, sale) => sum + (sale.количество || 0), 0);

  const generateApiKey = () => {
    return 'key_' + Math.random().toString(36).substr(2, 32) + '_' + Date.now();
  };

  const handleCreateKassa = async () => {
    if (!newKassaName || !newKassaNummer) {
      toast.error("Заполните название и номер кассы");
      return;
    }

    try {
      const apiKey = generateApiKey();
      const kassa = await base44.entities.Kassa.create({
        name: newKassaName,
        kassa_nummer: newKassaNummer,
        api_key: apiKey,
        status: "Не подключена"
      });

      setKassas([...kassas, kassa]);
      setNewKassaName("");
      setNewKassaNummer("");
      setShowNewKassa(false);
      toast.success("Касса создана");
    } catch (error) {
      toast.error("Ошибка при создании кассы");
      console.error(error);
    }
  };

  const handleDeleteKassa = async (id) => {
    if (!confirm("Вы уверены?")) return;
    try {
      await base44.entities.Kassa.delete(id);
      setKassas(kassas.filter(k => k.id !== id));
      toast.success("Касса удалена");
    } catch (error) {
      toast.error("Ошибка удаления");
    }
  };

  const copyApiKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success("API ключ скопирован");
  };

  const needsPurchaseCount = sales.filter(s => s.нужна_закупка).length;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Управление кассами</h1>
          <p className="text-slate-500 mt-1">Подключение касс и отслеживание продаж</p>
        </div>
        <Dialog open={showNewKassa} onOpenChange={setShowNewKassa}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" />
              Добавить кассу
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новую кассу</DialogTitle>
              <DialogDescription>
                Заполните данные кассы и получите API ключ для подключения
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Название кассы</Label>
                <Input
                  placeholder="Касса 1"
                  value={newKassaName}
                  onChange={(e) => setNewKassaName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Номер кассы</Label>
                <Input
                  placeholder="KASSA-001"
                  value={newKassaNummer}
                  onChange={(e) => setNewKassaNummer(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleCreateKassa}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Создать кассу
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Статистика продаж */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-500 text-sm">Продаж</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{totalSales}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-500 text-sm">Сумма (€)</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{totalAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-500 text-sm">Количество товара</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{totalQuantity}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-500 text-sm">Активные кассы</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{kassas.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Статистика */}
      {needsPurchaseCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-900">Требуется закупка</p>
                <p className="text-sm text-orange-700">{needsPurchaseCount} товаров упали ниже минимума</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Таблица касс */}
      <Card>
        <CardHeader>
          <CardTitle>Подключенные кассы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Номер кассы</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>API ключ</TableHead>
                  <TableHead>Последняя синхронизация</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kassas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Кассы не добавлены
                    </TableCell>
                  </TableRow>
                ) : (
                  kassas.map((kassa) => (
                    <TableRow key={kassa.id}>
                      <TableCell className="font-medium">{kassa.name}</TableCell>
                      <TableCell>{kassa.kassa_nummer}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            kassa.status === "Подключена" 
                              ? "bg-green-100 text-green-800"
                              : kassa.status === "Ошибка"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {kassa.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-xs">{kassa.api_key?.slice(0, 20)}...</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyApiKey(kassa.api_key)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {kassa.последняя_синхронизация 
                          ? format(new Date(kassa.последняя_синхронизация), 'dd.MM.yyyy HH:mm')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteKassa(kassa.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Таблица продаж */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Продажи через кассы</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Касса</TableHead>
                  <TableHead>Товар</TableHead>
                  <TableHead>Количество</TableHead>
                  <TableHead>Сумма (€)</TableHead>
                  <TableHead>Дата/Время</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Требуется закупка</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      Продаж еще нет
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id} className={sale.нужна_закупка ? "bg-orange-50" : ""}>
                      <TableCell className="font-medium">{sale.kassa_name}</TableCell>
                      <TableCell>{sale.ware_name}</TableCell>
                      <TableCell className="text-right">{sale.количество}</TableCell>
                      <TableCell className="text-right">{sale.сумма?.toFixed(2)}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(sale.дата), 'dd.MM.yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          sale.статус === "Обработана"
                            ? "bg-green-100 text-green-800"
                            : sale.статус === "Ошибка"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }>
                          {sale.статус}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sale.нужна_закупка ? (
                          <Badge className="bg-orange-100 text-orange-800 gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Да
                          </Badge>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Инструкция */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Инструкция подключения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-semibold">1.</span> Добавьте кассу в таблице выше</p>
          <p><span className="font-semibold">2.</span> Скопируйте API ключ кассы</p>
          <p><span className="font-semibold">3.</span> Настройте кассу на отправку данных на:</p>
          <div className="bg-white p-3 rounded border border-blue-200 font-mono text-xs mt-2">
            POST /functions/kassaWebhook<br/>
            Header: x-api-key: [ваш_api_ключ]<br/>
            Body: {"{ ware_id, количество, сумма }"}
          </div>
          <p className="mt-3"><span className="font-semibold">4.</span> После каждой продажи касса автоматически уменьшит количество товара на складе</p>
          <p><span className="font-semibold">5.</span> Если товар упадет ниже минимума - будет отмечено "Требуется закупка"</p>
        </CardContent>
      </Card>
    </div>
  );
}