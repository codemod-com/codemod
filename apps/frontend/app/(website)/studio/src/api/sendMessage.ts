import { apiClient } from "@/utils/apis/client";
import type { FetchError } from "@codemod-com/utilities";
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

const sendMessage = async ({
  message,
  parentMessageId,
  token,
}: SendMessageRequest): Promise<Either<Error, SendMessageResponse>> => {
  try {
    const response = await apiClient(SEND_MESSAGE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        parentMessageId,
      }),
    });

    return Either.right((await response.json()) as SendMessageResponse);
  } catch (e) {
    const err = e as FetchError;
    return Either.left(
      new Error(
        ((await err.response?.json()) as { message?: string }).message ??
          err.message,
      ),
    );
  }
};

export type { SendMessageRequest, SendMessageResponse };
export default sendMessage;
