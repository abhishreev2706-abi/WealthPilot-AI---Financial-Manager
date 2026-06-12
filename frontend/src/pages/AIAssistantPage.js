import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/shared/Card';

const SUGGESTIONS = [
  'Can I afford a new car?',
  'How much should I save monthly?',
  'Why are my expenses increasing?',
  'Am I financially healthy?',
  'What should I improve?',
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your AI Financial Assistant. Ask me anything about your finances." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [tab, setTab] = useState('chat');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (question) => {
    const q = question || input.trim();
    if (!q) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const { data } = await api.post('/api/ai/chat', { question: q });
      setMessages(m => [...m, { role: 'assistant', text: data.data?.answer || 'No response received.' }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: 'Unable to connect to AI service. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const loadForecast = async () => {
    try {
      const { data } = await api.get('/api/ai/forecast');
      setForecast(data.data);
    } catch {
      setForecast({ message: 'AI service unavailable.' });
    }
  };

  const loadAnalysis = async () => {
    try {
      const { data } = await api.get('/api/ai/analyze');
      setAnalysis(data.data);
    } catch {
      setAnalysis({ insights: ['AI service unavailable.'] });
    }
  };

  useEffect(() => {
    if (tab === 'forecast' && !forecast) loadForecast();
    if (tab === 'analysis' && !analysis) loadAnalysis();
  }, [tab]);

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">🤖 AI Financial Assistant</h2>
        <p className="text-slate-400 text-sm">Powered by financial analysis and machine learning</p>
      </div>

      <div className="flex gap-2">
        {['chat','forecast','analysis'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            {t === 'chat' ? '💬 Chat' : t === 'forecast' ? '📈 Forecast' : '🔍 Analysis'}
          </button>
        ))}
      </div>

      {tab === 'chat' && (
        <div className="flex flex-col gap-4">
          {/* Suggestions */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-600">
                {s}
              </button>
            ))}
          </div>

          {/* Chat window */}
          <Card className="h-96 overflow-y-auto flex flex-col gap-3 p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-700 text-slate-200 rounded-bl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </Card>

          <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your finances…"
              className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
              Send
            </button>
          </form>
        </div>
      )}

      {tab === 'forecast' && (
        <div className="space-y-4">
          {!forecast ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                {(forecast.forecast || []).map((v, i) => (
                  <Card key={i}>
                    <p className="text-slate-400 text-sm">Month +{i + 1}</p>
                    <p className="text-xl font-bold text-blue-400 mt-1">${Number(v).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">Projected expense</p>
                  </Card>
                ))}
              </div>
              {forecast.insight && (
                <Card>
                  <p className="text-sm text-slate-300">💡 {forecast.insight}</p>
                  {forecast.trend && (
                    <p className="text-xs text-slate-500 mt-2">Trend: <span className={`font-medium ${forecast.trend === 'increasing' ? 'text-red-400' : forecast.trend === 'decreasing' ? 'text-emerald-400' : 'text-blue-400'}`}>{forecast.trend}</span></p>
                  )}
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'analysis' && (
        <div className="space-y-4">
          {!analysis ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <Card>
                <h3 className="font-semibold text-sm text-slate-300 mb-3">🔍 Spending Insights</h3>
                {(analysis.insights || []).length === 0 ? (
                  <p className="text-slate-500 text-sm">No insights available yet. Add more transactions to get analysis.</p>
                ) : (
                  <ul className="space-y-2">
                    {(analysis.insights || []).map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              {analysis.category_breakdown && Object.keys(analysis.category_breakdown).length > 0 && (
                <Card>
                  <h3 className="font-semibold text-sm text-slate-300 mb-3">Category Breakdown (Last 3 Months)</h3>
                  <div className="space-y-2">
                    {Object.entries(analysis.category_breakdown).map(([cat, amount]) => {
                      const total = analysis.total_analyzed || 1;
                      const pct = ((amount / total) * 100).toFixed(1);
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize text-slate-300">{cat}</span>
                            <span className="text-slate-400">${Number(amount).toLocaleString()} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
