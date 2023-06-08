import { Configuration, OpenAIApi } from 'openai';

export class OpenAIService {
  public openAiAPI: OpenAIApi;
  constructor(apiKey: string) {
    const config = new Configuration({
      apiKey,
    });
    this.openAiAPI = new OpenAIApi(config);
  }

  public chat(message: string): Promise<string> {
    return new Promise((resolve, rejects) => {});
  }

  public transcription(fileForTranscription: string): Promise<string> {
    return new Promise((resolve, rejects) => {});
  }
}
