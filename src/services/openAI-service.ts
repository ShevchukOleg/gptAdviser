import { createReadStream } from 'fs';
import { ChatCompletionRequestMessage, ChatCompletionResponseMessage, Configuration, OpenAIApi } from 'openai';
import { ContextItem } from '../models/config.model.js';

export class OpenAIService {
  public openAiAPI: OpenAIApi;
  constructor(apiKey: string) {
    const config = new Configuration({
      apiKey,
    });
    this.openAiAPI = new OpenAIApi(config);
  }

  public async chat(messages: ContextItem[]): Promise<ChatCompletionResponseMessage | undefined> {
    const gptResponse = await this.openAiAPI.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    });
    console.log(gptResponse);

    return gptResponse!.data!.choices[0]!.message;
  }

  public async transcription(filePath: string): Promise<any> {
    // const file = await readFile(filePath);
    const stream = await createReadStream(filePath);
    /** */
    // const fileStat: Stats = await stat(filePath);
    // const fileForTranscription = {
    //   lastModified: fileStat.mtimeMs,
    //   name: filePath.split('/').pop() || '',
    //   size: fileStat.size,
    //   buffer: file,
    //   webkitRelativePath: '',
    //   type: '',
    //   arrayBuffer: async () => {
    //     return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
    //   },
    //   slice: (start = 0, end = fileStat.size, contentType = '') => {
    //     const slicedFilePath = filePath.slice(start, end);
    //     return createFileObject(slicedFilePath);
    //   },
    //   stream,
    //   text: async () => {
    //     return file.toString('utf-8');
    //   },
    //   prototype: Object.getPrototypeOf(Object),
    // };
    // @ts-ignore
    const AITranscription = await this.openAiAPI.createTranscription(stream, 'whisper-1');
    return AITranscription.data.text;
  }
}
