import "dotenv/config";
import axios from "axios";
import { parse } from "csv/sync";
import { readFile, readdir } from "fs/promises";
import z from "zod";

const UserSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string(),
  primary_email_address: z.string().email(),
  verified_email_addresses: z.string().email(),
});

const ZitadelUserSchema = z.object({
  userId: z.string().max(200).optional(),
  username: z.string().max(200).optional(),
  organization: z
    .object({
      orgId: z.string(),
      orgDomain: z.string(),
    })
    .optional(),
  profile: z.object({
    givenName: z.string().min(1).max(200),
    familyName: z.string().min(1).max(200),
    nickName: z.string().max(200).optional(),
    displayName: z.string().max(200).optional(),
    preferredLanguage: z.string().max(10).optional(),
    gender: z
      .enum([
        "GENDER_UNSPECIFIED",
        "GENDER_FEMALE",
        "GENDER_MALE",
        "GENDER_DIVERSE",
      ])
      .optional(),
  }),
  email: z.object({
    email: z.string().min(1).max(200),
    sendCode: z
      .object({
        urlTemplate: z.string().max(2000).optional(),
      })
      .optional(),
    returnCode: z.object().optional(),
    isVerified: z.boolean().optional(),
  }),
  phone: z
    .object({
      phone: z.string().max(200).optional(),
      sendCode: z.object().optional(),
      returnCode: z.object().optional(),
      isVerified: z.boolean().optional(),
    })
    .optional(),
  metadata: z
    .array(
      z.object({
        key: z.string().min(1).max(200),
        value: z.string().min(1).max(2000),
      }),
    )
    .optional(),
  password: z
    .object({
      password: z.string().min(1).max(200),
      changeRequired: z.boolean().optional(),
    })
    .optional(),
  hashedPassword: z
    .object({
      hash: z.string().min(1).max(200),
      changeRequired: z.boolean().optional(),
    })
    .optional(),
  idpLinks: z
    .array(
      z.object({
        idpId: z.string().max(200),
        userId: z.string().max(200),
        userName: z.string().max(200),
      }),
    )
    .optional(),
  totpSecret: z.string().max(200).optional(),
});

async function createHumanUser(rawUser) {
  try {
    const user = UserSchema.parse(rawUser);

    const zitadelUser = ZitadelUserSchema.parse({
      userId: user.id,
      username: user.username,
      profile: {
        givenName: user.first_name,
        familyName: (user.last_name ?? "").trim() || user.first_name,
      },
      email: {
        email: user.primary_email_address,
      },
    });

    const response = await axios
      .post(`${process.env.ZITADEL_API_URL}/v2/users/human`, zitadelUser, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.ZITADEL_BEARER_TOKEN}`,
        },
        maxBodyLength: Number.POSITIVE_INFINITY,
      })
      .then(({ data }) => data);
    console.error(
      `✅ Created user ${JSON.stringify(zitadelUser)} with response ${JSON.stringify(response)}\n`,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        `⛔️ Error creating user ${JSON.stringify(rawUser)}\n⚠️`,
        JSON.stringify(error.format()),
        "\n",
      );
    } else if (axios.isAxiosError(error)) {
      console.error(
        `⛔️ Error creating user ${JSON.stringify(rawUser)}\n⚠️`,
        JSON.stringify(error.response?.data),
        "\n",
      );
    } else {
      console.error(
        `⛔️ Error creating user ${JSON.stringify(rawUser)}\n⚠️`,
        error,
        "\n",
      );
    }
  }
}

const csvFiles = await readdir(".").then((files) =>
  files.filter((file) => file.endsWith(".csv")),
);

const records = await Promise.all(
  csvFiles.map((filename) =>
    readFile(filename)
      .then((buffer) => parse(buffer))
      .then((lines) => {
        const [header, ...records] = lines;

        return records.map((record) =>
          record.reduce((acc, value, index) => {
            acc[header[index]] = value;
            return acc;
          }, {}),
        );
      }),
  ),
).then((records) => records.flat());

for (const record of records) {
  await createHumanUser(record);
}
