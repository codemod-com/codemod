import apiClient from "@/utils/apis/client";
import type { AxiosError } from "axios";
import { SEND_MESSAGE } from "../constants";
import { Either } from "../utils/Either";

type SendMessageResponse = Readonly<{
  text: string;
  parentMessageId: string;
  conversationId: string;
}>;

type SendMessageRequest = Readonly<{
  message: string;
  parentMessageId?: string;
  conversationId?: string;
  token: string;
}>;

let sendMessage = async ({
  message,
  parentMessageId,
  token,
}: SendMessageRequest): Promise<Either<Error, SendMessageResponse>> => {
  try {
    let res = await apiClient.post<SendMessageResponse>(
      SEND_MESSAGE,
      {
        message,
        parentMessageId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return Either.right(res.data);
  } catch (e) {
    let err = e as AxiosError<{ message?: string }>;
    return Either.left(new Error(err.response?.data.message ?? err.message));
  }
};

export type { SendMessageRequest, SendMessageResponse };
export default sendMessage;
