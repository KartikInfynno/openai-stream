import { NextApiRequest } from "next";
import NextApiResponseServerIO from "../../types/next";
import OpenAI from 'openai';


export type ChatGPTAgent = "user" | "system";

interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}
interface OpenAIStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
  stream: boolean;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === "POST") {
    const prompt = req.body;
    if (!prompt) return new Response("Missing prompt", { status: 400 });
    const payload: OpenAIStreamPayload = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt.msg }],
      temperature: 0.7,
      stream: true,
    };

    const key = process.env.OPENAI_API_KEY
    const openai = new OpenAI(
      { apiKey: key }
    )
    const stream:any = await openai.chat.completions.create(payload);

    for await (const chunk of stream) {
      const data = chunk.choices[0]?.delta?.content || '';
      console.log({ data });
      res?.socket?.server?.io?.emit("message", data);
    }

    res.end()
  }
};
