import { useState, useRef, useEffect } from 'react';
import Layout from './Layout';

interface ChatbotPageProps {
  userInfo: { name: string; id: string };
  onBack: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatbotPage({ userInfo, onBack }: ChatbotPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `안녕하세요 ${userInfo?.name || '사용자'}님! 오늘 기분은 어떠신가요? 편하게 이야기해주세요.`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // 음성 인식 및 합성 초기화
  useEffect(() => {
    // 음성 인식 지원 확인
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ko-KR';
      
      recognitionRef.current.onstart = () => {
        setIsRecording(true);
      };
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('음성 인식 오류:', event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    // 음성 합성 초기화
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 음성 인식 시작/중지
  const toggleRecording = () => {
    if (!speechSupported) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // 텍스트를 음성으로 변환
  const speakText = (text: string) => {
    if (!synthRef.current) {
      alert('이 브라우저는 음성 합성을 지원하지 않습니다.');
      return;
    }

    // 현재 재생 중인 음성 중지
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  };

  // 음성 재생 중지
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 데모용 응답 (실제로는 AWS Bedrock API 호출)
      const response = await callDemoAPI(inputText, userInfo?.name);
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('챗봇 응답 오류:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: '죄송합니다. 잠시 후 다시 시도해주세요.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 데모용 API 호출
  const callDemoAPI = async (_message: string, userName = "사용자"): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = [
          `${userName}님, 그렇게 느끼시는군요. 더 자세히 말씀해주실 수 있나요?`,
          `이해합니다. 그런 상황에서는 어떤 기분이 드셨나요?`,
          `좋은 생각이네요. 그것에 대해 어떻게 생각하시나요?`,
          `힘든 시간을 보내고 계시는군요. 천천히 이야기해주세요.`,
          `정말 좋은 소식이네요! 기분이 어떠신가요?`,
          `그런 경험을 하셨군요. 지금은 어떤 마음이신가요?`
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        resolve(randomResponse);
      }, 1000 + Math.random() * 2000);
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center p-5 bg-white border-b border-gray-200 flex-shrink-0">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all mr-3"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 10H5M5 10L8 7M5 10L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-gray-800">AI 친구와 대화</h2>
            <p className="text-sm text-gray-600">마음을 편하게 나눠보세요</p>
          </div>
          <div className="w-8"></div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white text-gray-800 shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed">{message.text}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                  {message.sender === 'bot' && (
                    <button
                      onClick={() => speakText(message.text)}
                      disabled={isSpeaking}
                      className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                      title="음성으로 듣기"
                    >
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                        <path d="M3 9V15C3 15.5523 3.44772 16 4 16H6L10 20V4L6 8H4C3.44772 8 3 8.44772 3 9Z" fill="currentColor"/>
                        <path d="M14 7C14 5.89543 13.1046 5 12 5V3C14.2091 3 16 4.79086 16 7V13C16 15.2091 14.2091 17 12 17V15C13.1046 15 14 14.1046 14 13V7Z" fill="currentColor"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="p-5 bg-white border-t border-gray-200 flex-shrink-0">
          {isSpeaking && (
            <div className="flex justify-center mb-3">
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                  <rect x="6" y="4" width="8" height="12" rx="1" fill="currentColor"/>
                </svg>
                음성 중지
              </button>
            </div>
          )}
          
          <div className="flex items-end gap-2 bg-gray-100 rounded-2xl p-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? "음성을 인식하고 있습니다..." : "메시지를 입력하세요..."}
              className="flex-1 bg-transparent border-none outline-none resize-none px-3 py-2 text-sm max-h-20"
              rows={1}
              disabled={isLoading || isRecording}
            />
            
            <div className="flex gap-2">
              {speechSupported && (
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-full transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                  disabled={isLoading}
                  title={isRecording ? "음성 인식 중지" : "음성으로 입력"}
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M10 1C8.34315 1 7 2.34315 7 4V10C7 11.6569 8.34315 13 10 13C11.6569 13 13 11.6569 13 10V4C13 2.34315 11.6569 1 10 1Z" fill="currentColor"/>
                    <path d="M5 8C5.55228 8 6 8.44772 6 9V10C6 13.3137 8.68629 16 12 16H14C14.5523 16 15 16.4477 15 17C15 17.5523 14.5523 18 14 18H12C7.58172 18 4 14.4183 4 10V9C4 8.44772 4.44772 8 5 8Z" fill="currentColor"/>
                    <path d="M10 16V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
              
              <button
                onClick={sendMessage}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50"
                disabled={!inputText.trim() || isLoading || isRecording}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}