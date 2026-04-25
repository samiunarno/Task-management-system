import axios from 'axios';
import { Task, Routine } from '../config/models';

const ZHIPU_AI_API_KEY = process.env.ZHIPU_AI_API_KEY;

export class ZhipuAIService {
  static async generateStudyReport(userId: string) {
    if (!ZHIPU_AI_API_KEY) throw new Error('Zhipu AI key missing');

    const routines = await Routine.find({ userId });
    const tasks = await Task.find({ userId });

    const prompt = `
      Analyze this student's data and provide a daily report.
      Routines: ${JSON.stringify(routines)}
      Tasks: ${JSON.stringify(tasks)}
      Provide a JSON response with: report, improvements (array), suggestedTasks (array), moodScore (1-10).
    `;

    try {
      const response = await axios.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        model: "glm-4",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      }, {
        headers: {
          'Authorization': `Bearer ${ZHIPU_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return JSON.parse(response.data.choices[0].message.content);
    } catch (err: any) {
      console.error('Zhipu AI Error:', err.response?.data || err.message);
      throw new Error('AI Analysis failed');
    }
  }
}
