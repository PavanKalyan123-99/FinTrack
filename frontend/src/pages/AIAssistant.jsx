import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Award,
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const PROMPT_SUGGESTIONS = [
  'How can I cut expenses this month?',
  'Analyze my spending against the 50/30/20 rule',
  'What is my financial health score breakdown?',
  'Where am I spending the most money?',
];

const AIAssistant = () => {
  const { user } = useAuth();
  const { refreshKey } = useFinance();
  const currency = user?.currency || 'INR';

  const [healthScore, setHealthScore] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [refreshingInsights, setRefreshingInsights] = useState(false);

  // Chat State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello ${user?.name || 'there'}! I am FinTrack AI, your personal financial advisor. I have direct context on your income, expenses, category budgets, and savings rate. How can I assist you with your financial strategy today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chatBottomRef = useRef(null);

  useEffect(() => {
    const fetchAIData = async () => {
      try {
        setLoadingHealth(true);
        setLoadingInsights(true);

        const [healthRes, insightsRes] = await Promise.all([
          aiService.getHealthScore(),
          aiService.getInsights(false),
        ]);

        if (healthRes.success) setHealthScore(healthRes.data);
        if (insightsRes.success) setInsights(insightsRes.data);
      } catch (err) {
        console.error('Error loading AI data:', err);
      } finally {
        setLoadingHealth(false);
        setLoadingInsights(false);
      }
    };

    fetchAIData();
  }, [refreshKey]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleRefreshInsights = async () => {
    try {
      setRefreshingInsights(true);
      const res = await aiService.getInsights(true);
      if (res.success) {
        setInsights(res.data);
      }
    } catch (err) {
      console.error('Error refreshing insights:', err);
    } finally {
      setRefreshingInsights(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : inputMessage;
    if (!query || !query.trim() || isTyping) return;

    const userMsg = {
      role: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await aiService.askAdvisor(query.trim());
      if (res.success) {
        const assistantMsg = {
          role: 'assistant',
          text: res.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        text: 'I encountered an issue processing that query. Please try again in a moment.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primaryText tracking-tight">
              AI Financial Assistant
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-royalBlue text-white shadow-sm">
              Gemini Powered
            </span>
          </div>
          <p className="text-xs text-secondaryText mt-0.5">
            Real-time algorithmic financial health scoring and conversational intelligent advisory
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={handleRefreshInsights}
          isLoading={refreshingInsights}
        >
          Re-evaluate Insights
        </Button>
      </div>

      {/* Top Row: Health Score & Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-white via-white to-softCloud/20 border-borderColor">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
              Financial Health Score
            </span>
            <Award className="w-5 h-5 text-royalBlue" />
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke="#E2E8F0"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke="#0F4C75"
                  strokeWidth="10"
                  strokeDasharray={364}
                  strokeDashoffset={
                    364 - (364 * (healthScore?.score || 50)) / 100
                  }
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-primaryText tracking-tight">
                  {healthScore?.score || '--'}
                </span>
                <span className="text-[11px] font-semibold text-royalBlue uppercase">
                  / 100
                </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  (healthScore?.score || 0) >= 80
                    ? 'bg-emerald-100 text-incomeGreen'
                    : (healthScore?.score || 0) >= 60
                    ? 'bg-sky-100 text-skyFocus'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {healthScore?.status || 'Analyzing...'}
              </span>
              <p className="text-xs text-secondaryText mt-2 max-w-xs">
                Derived from your savings rate ({healthScore?.savingsRate || 0}%), cashflow surplus, and category budget discipline.
              </p>
            </div>
          </div>
        </Card>

        {/* AI Active Insights (2 Columns) */}
        <Card
          className="lg:col-span-2"
          title="Generated Financial Recommendations"
          subtitle="Real-time heuristics and AI cashflow diagnostic observations"
        >
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {insights.length === 0 ? (
              <p className="text-xs text-secondaryText py-6 text-center">
                No active warnings. Add more transactions to populate AI diagnostics.
              </p>
            ) : (
              insights.map((item, idx) => {
                const isWarning = item.severity === 'warning';
                const isSuccess = item.severity === 'success';
                const isTip = item.severity === 'tip';

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all text-xs flex items-start gap-3 ${
                      isWarning
                        ? 'bg-rose-50/70 border-rose-200 text-slate-800'
                        : isSuccess
                        ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                        : isTip
                        ? 'bg-sky-50/70 border-sky-200 text-slate-800'
                        : 'bg-slate-50 border-borderColor text-slate-800'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isWarning ? (
                        <AlertTriangle className="w-4 h-4 text-expenseRed" />
                      ) : isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-incomeGreen" />
                      ) : isTip ? (
                        <Lightbulb className="w-4 h-4 text-skyFocus" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-royalBlue" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-primaryText uppercase text-[10px] tracking-wider">
                          {item.category}
                        </span>
                        <Badge variant={item.severity} size="xs">
                          {item.severity}
                        </Badge>
                      </div>
                      <p className="leading-relaxed font-medium">{item.insight}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Conversational AI Financial Advisor Chat */}
      <Card
        title="FinTrack Conversational Advisor"
        subtitle="Chat directly with your contextual personal finance strategist"
        noPadding
      >
        {/* Suggestion Pills */}
        <div className="p-4 bg-slate-50/80 border-b border-borderColor flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-secondaryText flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-royalBlue" /> Quick Inquiries:
          </span>
          {PROMPT_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSendMessage(suggestion)}
              className="text-xs bg-white hover:bg-slate-100 text-primaryText border border-borderColor rounded-xl px-3 py-1 font-medium transition-all shadow-2xs hover:border-royalBlue/40 active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="p-4 sm:p-6 space-y-4 min-h-[320px] max-h-[460px] overflow-y-auto">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-2xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-sm ${
                    isUser
                      ? 'bg-royalBlue text-white'
                      : 'bg-deepSpace text-softCloud border border-royalBlue/30'
                  }`}
                >
                  {isUser ? 'You' : 'AI'}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-royalBlue text-white rounded-tr-none shadow-sm'
                      : 'bg-slate-100/90 text-primaryText rounded-tl-none border border-slate-200/60 shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 text-right ${
                      isUser ? 'text-white/70' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 mr-auto max-w-md">
              <div className="w-8 h-8 rounded-xl bg-deepSpace text-softCloud flex items-center justify-center text-xs font-bold border border-royalBlue/30">
                AI
              </div>
              <div className="p-3.5 bg-slate-100 rounded-2xl rounded-tl-none text-xs text-secondaryText flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-royalBlue animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-royalBlue animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-royalBlue animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Field Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white border-t border-borderColor flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Ask about cutting expenses, 50/30/20 budget allocation, or debt planning..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isTyping}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Send}
            disabled={!inputMessage.trim() || isTyping}
          >
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AIAssistant;
