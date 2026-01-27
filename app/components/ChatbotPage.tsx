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
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState(''); // 실시간 음성 인식 텍스트
  const [currentBotResponse, setCurrentBotResponse] = useState(''); // 현재 AI 응답 텍스트
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
      
      recognitionRef.current.continuous = true; // 연속 인식 활성화
      recognitionRef.current.interimResults = true; // 중간 결과 활성화
      recognitionRef.current.lang = 'ko-KR';
      
      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        setInterimTranscript('');
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // 실시간으로 중간 결과 업데이트
        setInterimTranscript(interimTranscript);
        
        // 최종 결과가 있으면 메시지 전송
        if (finalTranscript.trim()) {
          setInterimTranscript('');
          setIsRecording(false);
          sendMessageWithText(finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('음성 인식 오류:', event.error);
        setIsRecording(false);
        setInterimTranscript('');
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setInterimTranscript('');
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

  // 뒤로가기 시 음성 중지 후 나가기
  const handleBack = () => {
    // 음성 인식 중지
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // 음성 재생 중지
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    
    // 상태 초기화
    setIsRecording(false);
    setInterimTranscript('');
    setCurrentBotResponse('');
    
    // 페이지 나가기
    onBack();
  };
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



  const sendMessageWithText = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // 사용자 메시지는 내부적으로만 저장 (화면에 표시하지 않음)
    const userMessage: Message = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    // 메시지 목록에는 추가하지 않고 바로 AI 응답 요청
    setIsLoading(true);

    try {
      // 데모용 응답 (실제로는 AWS Bedrock API 호출)
      const response = await callDemoAPI(text, userInfo?.name);
      
      // AI 응답을 화면 중앙에 큰 글씨로 표시
      setCurrentBotResponse(response);
      
      // AI 응답을 자동으로 음성으로 읽어주기
      setTimeout(() => {
        speakText(response);
      }, 500);
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('챗봇 응답 오류:', error);
      const errorMessage = '죄송합니다. 잠시 후 다시 시도해주세요.';
      setCurrentBotResponse(errorMessage);
      
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
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
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50 to-purple-50 relative">
          {/* 캐릭터 영역 */}
          <div className="bg-gradient-to-b from-blue-50 to-transparent pb-6 mb-4">
            <div className="flex justify-center pt-6">
              <div className="relative">
                {/* 캐릭터 몸체 - 쿼카 스타일 */}
                <div className={`relative w-32 h-32 transition-all duration-300 ${
                  isSpeaking ? 'animate-pulse scale-110' : isLoading ? 'animate-bounce' : 'hover:scale-105'
                }`}>
                  {/* 메인 몸체 (갈색 쿼카) */}
                  <div className="w-full h-full bg-gradient-to-br from-amber-200 to-amber-300 rounded-full shadow-lg relative overflow-hidden">
                    
                    {/* 귀 */}
                    <div className="absolute -top-2 left-6">
                      <div className="w-6 h-8 bg-gradient-to-b from-amber-300 to-amber-400 rounded-full transform -rotate-12"></div>
                      <div className="w-4 h-6 bg-gradient-to-b from-pink-200 to-pink-300 rounded-full absolute top-1 left-1"></div>
                    </div>
                    <div className="absolute -top-2 right-6">
                      <div className="w-6 h-8 bg-gradient-to-b from-amber-300 to-amber-400 rounded-full transform rotate-12"></div>
                      <div className="w-4 h-6 bg-gradient-to-b from-pink-200 to-pink-300 rounded-full absolute top-1 right-1"></div>
                    </div>
                    
                    {/* 눈 */}
                    <div className="absolute top-8 left-7">
                      <div className={`w-4 h-4 bg-gray-800 rounded-full relative transition-all duration-200 ${
                        isSpeaking ? 'animate-pulse' : ''
                      }`}>
                        <div className="w-1 h-1 bg-white rounded-full absolute top-1 left-1"></div>
                      </div>
                    </div>
                    <div className="absolute top-8 right-7">
                      <div className={`w-4 h-4 bg-gray-800 rounded-full relative transition-all duration-200 ${
                        isSpeaking ? 'animate-pulse' : ''
                      }`}>
                        <div className="w-1 h-1 bg-white rounded-full absolute top-1 left-1"></div>
                      </div>
                    </div>
                    
                    {/* 코 */}
                    <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-1.5 bg-gray-700 rounded-full"></div>
                    </div>
                    
                    {/* 입 - 말하는 상태에 따라 변화 */}
                    <div className="absolute top-14 left-1/2 transform -translate-x-1/2">
                      {isSpeaking ? (
                        <div className="relative">
                          {/* 말하는 입 모양 - 애니메이션 */}
                          <div className="w-4 h-3 bg-gray-700 rounded-full animate-pulse"></div>
                          <div className="w-2 h-1 bg-pink-300 rounded-full absolute top-1 left-1 animate-bounce"></div>
                        </div>
                      ) : isLoading ? (
                        <div className="w-3 h-1 bg-gray-600 rounded-full animate-pulse"></div>
                      ) : (
                        <div className="relative">
                          {/* 웃는 입 */}
                          <div className="w-6 h-3 border-b-2 border-gray-700 rounded-b-full"></div>
                          <div className="w-1 h-1 bg-pink-300 rounded-full absolute -bottom-0.5 left-2.5"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* 볼 */}
                    <div className={`absolute top-10 left-3 transition-all duration-300 ${
                      isSpeaking ? 'scale-110' : ''
                    }`}>
                      <div className="w-3 h-3 bg-pink-300 rounded-full opacity-70"></div>
                    </div>
                    <div className={`absolute top-10 right-3 transition-all duration-300 ${
                      isSpeaking ? 'scale-110' : ''
                    }`}>
                      <div className="w-3 h-3 bg-pink-300 rounded-full opacity-70"></div>
                    </div>
                    
                    {/* 몸통 */}
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                      <div className="w-16 h-12 bg-gradient-to-b from-amber-200 to-amber-300 rounded-t-full"></div>
                      <div className="w-12 h-8 bg-gradient-to-b from-cream-100 to-cream-200 rounded-full absolute top-2 left-2"></div>
                    </div>
                    
                    {/* 팔 */}
                    <div className="absolute top-16 -left-2">
                      <div className={`w-4 h-8 bg-gradient-to-b from-amber-300 to-amber-400 rounded-full transform -rotate-12 transition-all duration-300 ${
                        isSpeaking ? 'animate-bounce' : ''
                      }`}></div>
                    </div>
                    <div className="absolute top-16 -right-2">
                      <div className={`w-4 h-8 bg-gradient-to-b from-amber-300 to-amber-400 rounded-full transform rotate-12 transition-all duration-300 ${
                        isSpeaking ? 'animate-bounce' : ''
                      }`}></div>
                    </div>
                  </div>
                </div>
                
                {/* 말하는 중 표시 */}
                {isSpeaking && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-full animate-pulse shadow-lg flex items-center gap-1">
                      🗣️ 쿼카가 말하는 중
                    </div>
                  </div>
                )}
                
                {/* 로딩 중 표시 */}
                {isLoading && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                      💭 쿼카가 생각 중
                    </div>
                  </div>
                )}
                
                {/* 음성 인식 중 표시 */}
                {isRecording && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full animate-pulse shadow-lg flex items-center gap-1">
                      👂 쿼카가 듣는 중
                    </div>
                  </div>
                )}
                
                {/* 음성 파형 애니메이션 */}
                {(isSpeaking || isRecording) && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full animate-pulse ${
                          isSpeaking ? 'bg-green-400' : 'bg-red-400'
                        }`}
                        style={{
                          height: `${Math.random() * 20 + 10}px`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.6s'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* 캐릭터 인사말 */}
            <div className="text-center mt-4 px-6">
              <p className="text-sm text-gray-600 font-medium">
                안녕하세요! 저는 쿼카에요 🐹
              </p>
              <p className="text-xs text-gray-500 mt-1">
                행복한 대화를 나눠봐요!
              </p>
            </div>
          </div>

          {/* AI 응답 큰 글씨 표시 */}
          {currentBotResponse && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setCurrentBotResponse('')}>
              <div className="bg-white rounded-3xl p-8 mx-4 max-w-4xl w-full shadow-2xl">
                <div className="text-center">
                  <div className="text-blue-500 text-lg font-semibold mb-6 flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    AI 응답
                  </div>
                  <div className="text-4xl font-bold text-gray-800 leading-relaxed min-h-[6rem] flex items-center justify-center px-4">
                    {currentBotResponse}
                  </div>
                  <div className="text-sm text-gray-500 mt-6">
                    화면을 터치하면 닫힙니다
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 실시간 음성 인식 텍스트 표시 */}
          {isRecording && interimTranscript && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
              <div className="bg-white rounded-3xl p-8 mx-4 max-w-2xl w-full shadow-2xl">
                <div className="text-center">
                  <div className="text-red-500 text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    음성 인식 중
                  </div>
                  <div className="text-3xl font-bold text-gray-800 leading-relaxed min-h-[4rem] flex items-center justify-center">
                    {interimTranscript || "말씀해주세요..."}
                  </div>
                  <div className="text-sm text-gray-500 mt-4">
                    말이 끝나면 자동으로 전송됩니다
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 대화 메시지들 (AI 응답만 표시) */}
          <div className="px-4 pb-4 space-y-3">
            {messages.filter(message => message.sender === 'bot').map((message) => (
              <div key={message.id} className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-white text-gray-800 shadow-md border border-gray-100">
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                    <button
                      onClick={() => speakText(message.text)}
                      disabled={isSpeaking}
                      className={`ml-2 p-1.5 rounded-full transition-all ${
                        isSpeaking ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                      title="음성으로 듣기"
                    >
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                        <path d="M3 9V15C3 15.5523 3.44772 16 4 16H6L10 20V4L6 8H4C3.44772 8 3 8.44772 3 9Z" fill="currentColor"/>
                        <path d="M14 7C14 5.89543 13.1046 5 12 5V3C14.2091 3 16 4.79086 16 7V13C16 15.2091 14.2091 17 12 17V15C13.1046 15 14 14.1046 14 13V7Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl shadow-md border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 음성 입력 영역 */}
        <div className="p-5 bg-white border-t border-gray-200 flex-shrink-0">
          {isSpeaking && (
            <div className="flex justify-center mb-3">
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition-all shadow-lg animate-pulse"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <rect x="6" y="4" width="8" height="12" rx="1" fill="currentColor"/>
                </svg>
                🔇 음성 중지
              </button>
            </div>
          )}
          
          <div className="flex justify-center items-center gap-6">
            {/* 나가기 버튼 */}
            <button
              onClick={onBack}
              className="p-4 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition-all shadow-lg hover:scale-105"
              title="대화 종료"
            >
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                <path d="M15 10H5M5 10L8 7M5 10L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* 마이크 버튼 */}
            {speechSupported ? (
              <button
                onClick={toggleRecording}
                className={`p-6 rounded-full transition-all shadow-xl ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse scale-110 shadow-red-200'
                    : 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 hover:scale-105 shadow-green-200'
                }`}
                disabled={isLoading}
                title={isRecording ? "🛑 음성 인식 중지" : "🎤 음성으로 말하기"}
              >
                {isRecording ? (
                  <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
                    <rect x="6" y="6" width="8" height="8" rx="1" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
                    <path d="M10 1C8.34315 1 7 2.34315 7 4V10C7 11.6569 8.34315 13 10 13C11.6569 13 13 11.6569 13 10V4C13 2.34315 11.6569 1 10 1Z" fill="currentColor"/>
                    <path d="M5 8C5.55228 8 6 8.44772 6 9V10C6 13.3137 8.68629 16 12 16H14C14.5523 16 15 16.4477 15 17C15 17.5523 14.5523 18 14 18H12C7.58172 18 4 14.4183 4 10V9C4 8.44772 4.44772 8 5 8Z" fill="currentColor"/>
                    <path d="M10 16V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-sm">음성 인식을 지원하지 않는 브라우저입니다</p>
              </div>
            )}

            {/* 음성 중지 버튼 (말하는 중일 때만 표시) */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-4 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-lg hover:scale-105"
                title="음성 중지"
              >
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                  <rect x="6" y="4" width="8" height="12" rx="1" fill="currentColor"/>
                </svg>
              </button>
            )}
          </div>
          
          {/* 도움말 */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 font-medium">
              {isRecording ? (
                <span className="text-red-600">🎤 말씀하시면 실시간으로 인식됩니다 (마이크 버튼으로 중지 가능)</span>
              ) : isSpeaking ? (
                <span className="text-green-600">� 쿼카가 응답 중입니다 (오른쪽 버튼으로 중지 가능)</span>
              ) : (
                <span>�🗣️ 마이크 버튼을 눌러 음성으로 대화해보세요</span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              왼쪽 화살표 버튼을 누르면 대화를 종료합니다
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}