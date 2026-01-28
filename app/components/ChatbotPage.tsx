import { useState, useRef, useEffect } from 'react';
import { useActivity } from '@/app/contexts/ActivityContext';
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
  audioUrl?: string;
  tags?: {
    kdsq_item_id?: string;
    risk_hint?: string;
  };
}

interface ApiSession {
  user_id: string;
  session_id: string;
}

// API 상수
const API_BASE_URL = 'https://8fvbrb5ai3.execute-api.ap-northeast-2.amazonaws.com/dev';

export default function ChatbotPage({ userInfo, onBack }: ChatbotPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [currentBotResponse, setCurrentBotResponse] = useState('');
  const [apiSession, setApiSession] = useState<ApiSession | null>(null);
  // const [sessionStarted, setSessionStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const { startSession: startActivitySession, endSession: endActivitySession } = useActivity();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // API 함수들
  const startSession = async (): Promise<ApiSession | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: userInfo?.name || '사용자',
          guardian_email: 'guardian@example.com', // 실제 구현시 사용자 입력 받기
          consent: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        user_id: data.user_id,
        session_id: data.session_id
      };
    } catch (error) {
      console.error('세션 시작 오류:', error);
      return null;
    }
  };

  const sendTurn = async (transcript: string): Promise<{ text: string; audioUrl?: string; tags?: any } | null> => {
    if (!apiSession) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/turn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: apiSession.session_id,
          user_id: apiSession.user_id,
          final_transcript: transcript
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        text: data.assistant_text,
        audioUrl: data.audio?.url,
        tags: data.tags
      };
    } catch (error) {
      console.error('턴 전송 오류:', error);
      return null;
    }
  };

  const endSession = async () => {
    if (!apiSession) return;

    try {
      await fetch(`${API_BASE_URL}/session/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: apiSession.session_id
        })
      });
    } catch (error) {
      console.error('세션 종료 오류:', error);
    }
  };

  // 컴포넌트 초기화 시 세션 시작
  useEffect(() => {
    const initializeSession = async () => {
      // 활동 세션 시작
      const activitySessionId = startActivitySession('chat');
      setCurrentSessionId(activitySessionId);
      
      const session = await startSession();
      if (session) {
        setApiSession(session);
        // setSessionStarted(true);
        
        // 초기 환영 메시지 추가
        const welcomeMessage: Message = {
          id: Date.now(),
          text: `안녕하세요 ${userInfo?.name || '사용자'}님! 오늘 기분은 어떠신가요? 편하게 이야기해주세요.`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      } else {
        // API 연결 실패시 데모 모드로 전환
        console.warn('API 연결 실패, 데모 모드로 전환');
        const welcomeMessage: Message = {
          id: Date.now(),
          text: `안녕하세요 ${userInfo?.name || '사용자'}님! (데모 모드) 오늘 기분은 어떠신가요?`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    };

    initializeSession();

    // 컴포넌트 언마운트 시 세션 종료
    return () => {
      if (apiSession) {
        endSession();
      }
      // 활동 세션 종료
      if (currentSessionId) {
        endActivitySession(currentSessionId, undefined, { messageCount: messages.length });
      }
    };
  }, []);

  // 음성 인식 및 합성 초기화
  useEffect(() => {
    // 음성 인식 지원 확인
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
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
        // 사용자가 수동으로 중지한 경우가 아니라면 상태 업데이트
        if (isRecording) {
          setIsRecording(false);
          setInterimTranscript('');
        }
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
      // 음성 인식 중지
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      setInterimTranscript('');
    } else {
      // 음성 인식 시작
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    }
  };

  // 텍스트를 음성으로 변환 (API 오디오 우선 사용)
  const speakText = (text: string, audioUrl?: string) => {
    // 기존 음성 중지
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    setIsSpeaking(true);

    // API에서 제공한 오디오 URL이 있으면 우선 사용
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        currentAudioRef.current = null;
      };
      
      audio.onerror = () => {
        console.warn('API 오디오 재생 실패, TTS로 대체');
        setIsSpeaking(false);
        currentAudioRef.current = null;
        // TTS로 대체
        speakWithTTS(text);
      };
      
      audio.play().catch(() => {
        console.warn('API 오디오 재생 실패, TTS로 대체');
        setIsSpeaking(false);
        currentAudioRef.current = null;
        speakWithTTS(text);
      });
    } else {
      // API 오디오가 없으면 브라우저 TTS 사용
      speakWithTTS(text);
    }
  };

  // 브라우저 TTS 사용
  const speakWithTTS = (text: string) => {
    if (!synthRef.current) {
      setIsSpeaking(false);
      return;
    }

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
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeaking(false);
  };

  const sendMessageWithText = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      let response;
      
      if (apiSession) {
        // 실제 API 호출
        response = await sendTurn(text.trim());
      } else {
        // 데모 모드
        response = await callDemoAPI(text.trim(), userInfo?.name);
      }

      if (response) {
        setCurrentBotResponse(response.text);
        
        // 음성 재생
        setTimeout(() => {
          speakText(response.text, response.audioUrl);
        }, 500);
        
        const botMessage: Message = {
          id: Date.now() + 1,
          text: response.text,
          sender: 'bot',
          timestamp: new Date(),
          audioUrl: response.audioUrl,
          tags: response.tags
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('응답을 받을 수 없습니다');
      }
      
    } catch (error) {
      console.error('메시지 전송 오류:', error);
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

  // 데모용 API 호출 (API 연결 실패시 사용)
  const callDemoAPI = async (_message: string, userName = "사용자"): Promise<{ text: string; audioUrl?: string; tags?: any }> => {
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
        resolve({
          text: randomResponse,
          tags: { kdsq_item_id: 'NONE', risk_hint: 'NONE' }
        });
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
            onClick={async () => {
              // 세션 종료 후 뒤로가기
              if (apiSession) {
                await endSession();
              }
              // 활동 세션 종료
              if (currentSessionId) {
                endActivitySession(currentSessionId, undefined, { messageCount: messages.length });
              }
              onBack();
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all mr-3"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 10H5M5 10L8 7M5 10L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-gray-800">AI 친구와 대화</h2>
            <p className="text-sm text-gray-600">
              {apiSession ? '실시간 AI 상담' : '데모 모드'} - 마음을 편하게 나눠보세요
            </p>
          </div>
          <div className="w-8"></div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50 to-purple-50 relative">
          {/* 캐릭터 영역 */}
          <div className="bg-gradient-to-b from-blue-50 to-transparent pb-6 mb-4">
            <div className="flex justify-center pt-6">
              <div className="relative">
                {/* 캐릭터 몸체 */}
                <div className={`relative w-28 h-28 transition-all duration-300 ${
                  isSpeaking ? 'animate-pulse scale-110' : isLoading ? 'animate-bounce' : 'hover:scale-105'
                }`}>
                  {/* 메인 몸체 (노란 원) */}
                  <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full shadow-lg relative overflow-hidden">
                    
                    {/* 볏 (빨간 부분) */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="w-7 h-5 bg-gradient-to-b from-red-400 to-red-500 rounded-t-full"></div>
                      <div className="w-5 h-3 bg-gradient-to-b from-red-400 to-red-500 rounded-t-full absolute -right-2 top-1"></div>
                      <div className="w-3 h-2 bg-gradient-to-b from-red-400 to-red-500 rounded-t-full absolute -right-3 top-2"></div>
                    </div>
                    
                    {/* 눈 */}
                    <div className="absolute top-7 left-5">
                      <div className="w-5 h-5 bg-gray-800 rounded-full relative">
                        <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1 left-1"></div>
                      </div>
                    </div>
                    <div className="absolute top-7 right-5">
                      <div className="w-5 h-5 bg-gray-800 rounded-full relative">
                        <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1 left-1"></div>
                      </div>
                    </div>
                    
                    {/* 부리 */}
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
                      <div className="w-2.5 h-1.5 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full"></div>
                    </div>
                    
                    {/* 볼 */}
                    <div className="absolute top-9 left-2.5">
                      <div className="w-3 h-3 bg-pink-300 rounded-full opacity-60"></div>
                    </div>
                    <div className="absolute top-9 right-2.5">
                      <div className="w-3 h-3 bg-pink-300 rounded-full opacity-60"></div>
                    </div>
                    
                    {/* 날개 */}
                    <div className="absolute top-14 -left-1.5">
                      <div className="w-5 h-7 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full transform -rotate-12"></div>
                    </div>
                    <div className="absolute top-14 -right-1.5">
                      <div className="w-5 h-7 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full transform rotate-12"></div>
                    </div>
                    
                    {/* 발 */}
                    <div className="absolute -bottom-1.5 left-7">
                      <div className="w-2.5 h-1.5 bg-orange-400 rounded-full"></div>
                    </div>
                    <div className="absolute -bottom-1.5 right-7">
                      <div className="w-2.5 h-1.5 bg-orange-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                {/* 말하는 중 표시 */}
                {isSpeaking && (
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse shadow-lg">
                      🗣️ 말하는 중
                    </div>
                  </div>
                )}
                
                {/* 로딩 중 표시 */}
                {isLoading && (
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                      💭 생각 중
                    </div>
                  </div>
                )}
                
                {/* 음성 인식 중 표시 */}
                {isRecording && (
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse shadow-lg">
                      👂 듣는 중
                    </div>
                  </div>
                )}
                
                {/* 음성 파형 애니메이션 */}
                {(isSpeaking || isRecording) && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full animate-pulse ${
                          isSpeaking ? 'bg-green-400' : 'bg-red-400'
                        }`}
                        style={{
                          height: `${Math.random() * 15 + 8}px`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.5s'
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
                안녕하세요! 저는 삐약이에요 🐥
              </p>
              <p className="text-xs text-gray-500 mt-1">
                편하게 대화해주세요!
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

          {/* 대화 메시지들 */}
          <div className="px-4 pb-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md border ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 text-white border-blue-400' 
                    : 'bg-white text-gray-800 border-gray-100'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                    {message.sender === 'bot' && (
                      <div className="flex items-center gap-1">
                        {/* KDSQ 태그 표시 */}
                        {message.tags?.kdsq_item_id && message.tags.kdsq_item_id !== 'NONE' && (
                          <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
                            {message.tags.kdsq_item_id}
                          </span>
                        )}
                        {/* 위험 힌트 표시 */}
                        {message.tags?.risk_hint && message.tags.risk_hint !== 'NONE' && (
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                            ⚠️
                          </span>
                        )}
                        <button
                          onClick={() => speakText(message.text, message.audioUrl)}
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
                    )}
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
                title={isRecording ? "🛑 음성 인식 중지 (다시 클릭)" : "🎤 음성으로 말하기"}
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
          </div>
          
          {/* 도움말 */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 font-medium">
              {isRecording ? (
                <span className="text-red-600">🎤 말씀하시면 실시간으로 인식됩니다 (마이크 버튼으로 중지 가능)</span>
              ) : isSpeaking ? (
                <span className="text-green-600">🗣️ 삐약이가 응답 중입니다</span>
              ) : (
                <span>🗣️마이크 버튼을 눌러 음성으로 대화해보세요</span>
              )}
            </p>
            {isRecording && (
              <p className="text-xs text-red-500 mt-1 animate-pulse">
                💡 마이크 버튼을 다시 누르면 음성 인식이 중지됩니다
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}