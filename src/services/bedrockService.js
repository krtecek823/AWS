// Amazon Bedrock 서비스 연동
// 실제 사용 시에는 백엔드에서 처리해야 합니다 (보안상 이유로)

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// AWS 설정 (환경변수로 관리해야 함)
const client = new BedrockRuntimeClient({
  region: process.env.REACT_APP_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  },
});

export const callBedrock = async (message, userName = "사용자") => {
  try {
    // Claude 3 Haiku 모델 사용
    const modelId = "anthropic.claude-3-haiku-20240307-v1:0";
    
    const prompt = `
Human: 당신은 마음 케어 앱의 친근한 AI 상담사입니다. 
사용자 이름: ${userName}
사용자의 마음을 편안하게 해주고, 공감하며, 따뜻한 조언을 해주세요.
답변은 한국어로 하고, 친근하고 따뜻한 톤으로 대화해주세요.
길지 않게 2-3문장으로 답변해주세요.

사용자 메시지: ${message}
Assistant:`;

    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const command = new InvokeModelCommand({
      modelId,
      body,
      contentType: "application/json",
      accept: "application/json",
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return responseBody.content[0].text;
    
  } catch (error) {
    console.error("Bedrock API 호출 오류:", error);
    
    // 데모용 응답 (실제 API 호출 실패 시)
    const demoResponses = [
      `${userName}님, 그렇게 느끼시는군요. 더 자세히 말씀해주실 수 있나요?`,
      `이해합니다. 그런 상황에서는 어떤 기분이 드셨나요?`,
      `좋은 생각이네요. 그것에 대해 어떻게 생각하시나요?`,
      `힘든 시간을 보내고 계시는군요. 천천히 이야기해주세요.`,
      `정말 좋은 소식이네요! 기분이 어떠신가요?`,
      `그런 경험을 하셨군요. 지금은 어떤 마음이신가요?`
    ];
    
    return demoResponses[Math.floor(Math.random() * demoResponses.length)];
  }
};