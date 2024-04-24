import Button from "@/components/shared/Button";
import Checkbox from "@/components/shared/Checkbox";
import Dropdown from "@/components/shared/Dropdown";
import FilterButton from "@/components/shared/FilterButton";
import Input from "@/components/shared/Input";
import Snippet from "@/components/shared/Snippet";
import Tabs, { TabContent } from "@/components/shared/Tabs";
import Tag from "@/components/shared/Tag";

export default function Styleguide() {
  return (
    <div className="pt-[calc(var(--header-height)+5rem)]">
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Buttons</h1>
        <div className="flex w-full flex-wrap items-center justify-start gap-s">
          <Button intent="primary">Button</Button>

          <Button intent="primary" icon="arrow-right">
            Button
          </Button>

          <Button intent="primary" icon="book-open">
            Docs
          </Button>

          <Button intent="secondary" icon="command" iconPosition="left">
            Button
          </Button>

          <Button intent="primary" arrow>
            Button
          </Button>

          <Button intent="primary" arrow disabled>
            Button
          </Button>

          <Button intent="primary" icon="arrow-right" disabled>
            Button
          </Button>

          <Button intent="primary" icon="arrow-right" loading>
            Button
          </Button>

          <Button intent="secondary" icon="arrow-right" loading>
            Button
          </Button>

          <Button intent="primary-icon-only" icon="copy"></Button>

          <Button intent="secondary-icon-only" icon="arrow-right"></Button>

          <Button glow intent="secondary">
            Glowing
          </Button>
        </div>
      </div>
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Inputs</h1>
        <div className="flex w-full flex-wrap items-start justify-start gap-s">
          <Input />

          <Input icon="mail" />

          <Input error="There was an error" />

          <Input icon="mail" error="There was an error" />
        </div>
      </div>
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Select</h1>
        <div className="flex w-full flex-wrap items-start justify-start gap-s">
          <Dropdown
            label="Default"
            options={[
              { value: "1", label: "Option 1" },
              {
                value: "2",
                label: "Option 2",
              },
            ]}
          />
          <Dropdown
            label="With error"
            error="There was an error"
            options={[
              { value: "1", label: "Option 1" },
              {
                value: "2",
                label: "Option 2",
              },
            ]}
          />
        </div>
      </div>
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Checkbox</h1>
        <div className="flex w-full flex-wrap items-start justify-start gap-s">
          <Checkbox />
          <Checkbox checked />
        </div>
      </div>
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Tags</h1>
        <div className="flex w-full flex-wrap items-start justify-start gap-s">
          <Tag intent="primary">Primary</Tag>
          <Tag intent="default">Default</Tag>
        </div>
      </div>

      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Filter buttons</h1>
        <div className="flex w-full flex-col items-start justify-start gap-xs">
          <FilterButton intent="default" icon="filter">
            Filter default
          </FilterButton>
          <FilterButton intent="active" icon="filter">
            Filter dismissable
          </FilterButton>
          <FilterButton icon="filter" disabled>
            Filter disabled
          </FilterButton>
        </div>
      </div>

      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Snippets</h1>
        <div className="flex w-full flex-col items-start justify-start gap-xs">
          <Snippet command="npm tinloof new" />
          <Snippet command="npx codemode learn" />
        </div>
      </div>
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Tabs</h1>
        <div className="flex w-full flex-col items-start justify-start gap-xs">
          <Tabs
            items={[
              { id: "1", label: "Tab 1" },
              { id: "2", label: "Tab 2 with longer text" },
              { id: "3", label: "Tab 3" },
              { id: "4", label: "Tab 4" },
            ]}
          >
            <TabContent forId="1">Tab 1 content</TabContent>
            <TabContent forId="2">Tab 2 content</TabContent>
            <TabContent forId="3">Tab 3 content</TabContent>
            <TabContent forId="4">Tab 4 content</TabContent>
          </Tabs>
        </div>
      </div>

      {/* <div className="p-[40px]">
        <h1 className="s-heading pb-6">Registry Card</h1>
        <div className="flex w-full flex-col items-start justify-start gap-xs">
          <RegistryCard />
        </div>
      </div> */}
    </div>
  );
}
