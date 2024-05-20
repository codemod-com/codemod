import Icon, {
  IconId,
  TechLogoId,
  type LogoName,
  type IconName,
  TechLogo,
} from "@/components/shared/Icon";
import { SearchIcon } from "@sanity/icons";
import { Box, Card, Dialog, Flex, Grid, Text, TextInput } from "@sanity/ui";
import { useCallback, useState } from "react";
import { defineField, set, unset } from "sanity";
import styled from "styled-components";

const ids = Object.values(IconId);
const logoIds = Object.values(TechLogoId);

export const icon = defineField({
  name: "icon",
  title: "Icon",
  type: "string",
  description: "Click to select an Icon",
  components: {
    input: CustomSelect,
  },
  initialValue: "standard",
  options: {
    list: ids.map((id) => ({
      value: id,
      title: id,
    })),
  },
});

export const logo = defineField({
  name: "logo",
  title: "Logo",
  type: "string",
  description: "Click to select a Logo",
  components: {
    input: CustomSelect,
  },
  options: {
    list: logoIds.map((id) => ({
      value: id,
      title: id,
    })),
  },
});

export const addSpaceBeforeCapitalLetters = (inputString: string) =>
  inputString.replace(/([A-Z])/g, " $1").trim();

const StyledFlex = styled(Flex)`
  &:hover {
    background: var(--card-bg-color);
    cursor: pointer;
  }
`;

function CustomSelect(props: any) {
  const [open, setOpen] = useState(false);
  const onClose = useCallback(() => setOpen(false), []);
  const onOpen = useCallback(() => setOpen(true), []);
  const [search, setSearch] = useState("");
  const isTechLogo = /logo\b/.test(props.id);

  const Icons = isTechLogo ? TechLogoId : IconId;

  const icons = search
    ? Object.values(Icons).map((icon) =>
        icon.toLowerCase().includes(search.toLowerCase()) ? icon : null,
      )
    : Object.values(Icons).map((icon) => icon);
  const { elementProps, onChange, value = "" } = props;

  const handleChange = (value: string) => {
    onChange(value ? set(value) : unset());
    setOpen(false);
  };
  return (
    <>
      <Flex
        style={{
          backgroundColor: "var(--card-bg-color)",
        }}
        {...elementProps}
        align="center"
        gap={4}
        onClick={onOpen}
      >
        {value ? (
          <StyledFlex
            align="center"
            style={{
              borderRadius: "1px",
              border: "1px solid var(--card-border-color)",
              width: "100%",
            }}
            padding={3}
            gap={4}
          >
            <div
              style={{
                backgroundColor: "white",
                color: "black",
                padding: 2,
                borderRadius: 4,
                cursor: "pointer",
                height: "36px",
                width: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isTechLogo ? (
                <TechLogo name={value as LogoName} />
              ) : (
                <Icon name={value as IconName} />
              )}
            </div>
            <Text>{addSpaceBeforeCapitalLetters(value)}</Text>
          </StyledFlex>
        ) : (
          <StyledFlex
            align="center"
            style={{
              borderRadius: "1px",
              border: "1px solid #3f434a",
              width: "100%",
            }}
            padding={3}
            gap={4}
          >
            <Text>Click to select an Icon</Text>
          </StyledFlex>
        )}
      </Flex>

      {open && (
        <Dialog
          header="Icons"
          id="dialog-example"
          onClose={onClose}
          zOffset={1000}
          width={100}
        >
          <Box padding={4}>
            <TextInput
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search for an icon"
              icon={SearchIcon}
              value={search}
            />
            <Grid columns={[2, 3, 4, 5]} gap={[1, 1, 2, 3]} padding={4}>
              {icons.map((icon) => {
                if (!icon) return null;

                return (
                  <Flex
                    key={icon}
                    onClick={() => handleChange(icon)}
                    value={icon}
                    align="center"
                    direction="column"
                    gap={4}
                  >
                    <BlockVariantCard icon={icon} type={props.id} />
                  </Flex>
                );
              })}
            </Grid>
          </Box>
        </Dialog>
      )}
    </>
  );
}

const BlockVariantCardWrapper = styled(Card)`
  all: initial;
  padding: 0.75em;
  border-radius: 0.1875rem;

  &:hover {
    background: var(--card-bg-color);
    cursor: pointer;
  }
  &[data-has-asset="true"] {
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 0.75rem;
  }
  &[data-has-asset="false"] {
    display: block;
    border: 1px solid var(--card-border-color);
  }
`;

function BlockVariantCard({
  icon,
  type,
}: {
  icon: string;
  type: "logo" | "icon";
}) {
  return (
    (<BlockVariantCardWrapper
      tone="transparent"
      data-has-asset={!!icon}
      padding={2}
      radius={2}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          color: "black",
          padding: 2,
          borderRadius: 4,
          cursor: "pointer",
          height: "36px",
          width: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/logo\b/.test(type) ? (
          <TechLogo name={icon as LogoName} />
        ) : (
          <Icon name={icon as IconName} />
        )}
      </div>
      <Text size={0}>{addSpaceBeforeCapitalLetters(icon)}</Text>
    </BlockVariantCardWrapper>)
  );
}
