import { aiApiClient } from "@/utils/apis/client";
import type { AxiosError } from "axios";
import { SEND_CHAT } from "../constants";
import { Either } from "../utils/Either";

type SendMessageResponse = string;

type SendMessageRequest = Readonly<{
  message: string;
  token: string;
}>;

const sendChat = async ({
  message,
  token,
}: SendMessageRequest): Promise<Either<Error, SendMessageResponse>> => {
  try {
    const res = await aiApiClient.post<SendMessageResponse>(
      SEND_CHAT,
      {
        messages: [{ content: message, role: "user" }],
        engine: "gpt-4",
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return Either.right(res.data);
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    return Either.left(new Error(err.response?.data.message ?? err.message));
  }
};

export type { SendMessageRequest, SendMessageResponse };
export default sendChat;
