import { Badge, type BadgeTone, Flex, Stack, Text } from "@sanity/ui";
import React from "react";
import { type TextInputProps, type TextOptions, useFormValue } from "sanity";

type CountedTextOptions = TextOptions & {
  maxLength?: number;
  minLength?: number;
};

function CharacterCount(props: CountedTextOptions & { value?: string }) {
  if (!props.maxLength && !props.minLength) {
    return null;
  }

  let { value = "" } = props;

  let maxPercentage =
    props.maxLength && (value.length / props.maxLength) * 100;
  let tone: BadgeTone = "primary";
  if (maxPercentage && maxPercentage > 100) {
    tone = "critical";
  } else if (maxPercentage && maxPercentage > 75) {
    tone = "caution";
  }

  if (props.minLength && value.length < props.minLength) {
    tone = "caution";
  }
  return (
    <Badge mode="outline" tone={tone}>
      {value.length} / {props.maxLength}
    </Badge>
  );
}

export function InputWithCharacterCount(props: TextInputProps) {
  let document: any = useFormValue([]);

  let defaultTitle =
    props.id === "seo.title"
      ? ["organization", "person", "podcastShow"].includes(document?._type)
        ? document?.name
        : document?.title
      : undefined;

  props.elementProps.placeholder = defaultTitle;

  return (
    <Stack space={2}>
      {props.renderDefault(props)}
      <Flex justify="flex-end">
        <CharacterCount
          value={props.value}
          {...((props.schemaType.options || {}) as CountedTextOptions)}
        />
      </Flex>
    </Stack>
  );
}
