import React, { useState, useEffect, useRef } from 'react';
import { X, Utensils, Coffee, ShoppingBag, MoreHorizontal, Trash2, Plus, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getSpendingComment } from '../services/gemini';

interface Transaction {
  id: string;
  amount: number;
  category: 'food' | 'snack' | 'shopping' | 'other';
  date: number;
}

interface SpendingTrackerProps {
  onClose: () => void;
}

const SpendingTracker: React.FC<SpendingTrackerProps> = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Transaction['category'] | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // AI Comment State
  const [aiComment, setAiComment] = useState<string>('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gemini_weather_ledger');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  // Save to LocalStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('gemini_weather_ledger', JSON.stringify(transactions));
  }, [transactions]);

  const handleSave = () => {
    if (!amount || !category) return;

    // Create date object for the selected date but with current time to preserve order
    const now = new Date();
    const entryDate = new Date(selectedDate);
    entryDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      amount: parseInt(amount.replace(/,/g, ''), 10),
      category,
      date: entryDate.getTime(),
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setAmount('');
    setCategory(null);
  };

  const handleDelete = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const formatCurrency = (val: number | string) => {
    if (!val) return '';
    return Number(val).toLocaleString();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmount(val);
  };

  // Filter transactions for the selected date
  const filteredTransactions = transactions.filter(t => 
    new Date(t.date).toDateString() === selectedDate.toDateString()
  );

  const dailyTotal = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const categoriesList = filteredTransactions.map(t => t.category);

  // Fetch AI Comment when transactions change (debounced slightly by effect nature)
  useEffect(() => {
    const fetchComment = async () => {
      if (dailyTotal === 0) {
        setAiComment("오늘도 무지출 챌린지 성공? 멋져요! 👍");
        return;
      }
      
      setIsCommentLoading(true);
      try {
        const comment = await getSpendingComment(dailyTotal, categoriesList);
        setAiComment(comment);
      } catch (e) {
        setAiComment("소비 요정의 컨디션이 좋지 않네요.");
      } finally {
        setIsCommentLoading(false);
      }
    };

    // Debounce to prevent excessive calls if user deletes multiple items quickly
    const timer = setTimeout(() => {
      fetchComment();
    }, 800);

    return () => clearTimeout(timer);
  }, [dailyTotal, selectedDate]); // Re-run when total amount changes or date changes

  const categories = [
    { id: 'food', label: '밥값', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
    { id: 'snack', label: '음료/간식', icon: Coffee, color: 'bg-brown-100 text-amber-700' },
    { id: 'shopping', label: '쇼핑', icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
    { id: 'other', label: '기타', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-600' },
  ] as const;

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">가계부</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
        
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {format(selectedDate, 'M월 d일', { locale: ko })} 지출 입력
            </label>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₩</span>
              <input
                type="text"
                value={formatCurrency(amount)}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-8 pr-4 py-2 text-4xl font-bold text-gray-900 placeholder-gray-200 focus:outline-none border-b-2 border-transparent focus:border-blue-500 transition-colors bg-transparent"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 ${
                  category === cat.id 
                    ? 'bg-gray-900 text-white scale-105 shadow-lg' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <cat.icon className={`w-6 h-6 mb-1 ${category === cat.id ? 'text-white' : ''}`} />
                <span className="text-[10px] font-medium">{cat.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={!amount || !category}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 transition-all ${
              amount && category
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span>기록하기</span>
          </button>
        </div>

        {/* Summary Section */}
        <div className="bg-gray-50 rounded-3xl p-6 flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">
            {format(selectedDate, 'M월 d일', { locale: ko })} 쓴 돈
          </span>
          <span className="text-2xl font-bold text-gray-900">₩{formatCurrency(dailyTotal)}</span>
        </div>

        {/* History Section */}
        <div className="pb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">소비 내역</h3>
            
            {/* Date Picker */}
            <label className="relative flex items-center cursor-pointer">
              <div className="flex items-center space-x-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors relative z-0 pointer-events-none">
                <Calendar className="w-3.5 h-3.5" />
                <span>{format(selectedDate, 'yyyy.MM.dd')}</span>
              </div>
              <input 
                type="date" 
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(new Date(e.target.value));
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </label>
          </div>

          <div className="space-y-3 mb-6">
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                {format(selectedDate, 'M월 d일', { locale: ko })} 내역이 없습니다.
              </p>
            ) : (
              filteredTransactions.map((t) => {
                const catInfo = categories.find(c => c.id === t.category);
                return (
                  <div key={t.id} className="flex items-center justify-between p-1 group animate-fade-in">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2.5 rounded-xl ${catInfo?.color.replace('text-', 'bg-').replace('100', '50')} bg-opacity-50`}>
                         {catInfo && <catInfo.icon className={`w-5 h-5 ${catInfo.color.split(' ')[1]}`} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">{catInfo?.label}</span>
                        <span className="text-xs text-gray-400">
                          {format(t.date, 'a h:mm', { locale: ko })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-gray-900">-{formatCurrency(t.amount)}</span>
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* AI Comment Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100 flex items-start space-x-3 animate-in fade-in duration-500">
            <div className="bg-white p-2 rounded-full shadow-sm">
              {isCommentLoading ? (
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-500" />
              )}
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-xs font-bold text-indigo-400 mb-0.5">Gemini's Comment</p>
              <p className="text-sm text-gray-800 font-medium leading-snug">
                {isCommentLoading ? "지출 내역을 분석하고 있어요..." : `"${aiComment}"`}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SpendingTracker;
